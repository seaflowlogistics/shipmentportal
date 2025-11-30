import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import * as XLSX from 'xlsx';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Helper to parse Excel date
function parseExcelDate(dateVal: any): Date {
    if (!dateVal) return new Date();
    if (typeof dateVal === 'number') {
        // Excel date serial number
        return new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    }
    // Try parsing string
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? new Date() : d;
}

// Helper to generate shipment ID if missing (though Excel has it)
function generateShipmentId(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `SHP-${dateStr}-${random}`;
}

async function importShipments() {
    try {
        const filePath = path.join(process.cwd(), '../SHIPMENT_REGISTRY 28-10-2025.xlsx');
        console.log(`Reading file from: ${filePath}`);

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log(`Found ${data.length} records to import...`);

        // Get admin user ID for 'created_by' field
        const adminRes = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        const adminId = adminRes.rows[0]?.id;

        if (!adminId) {
            throw new Error('No admin user found to assign shipments to.');
        }

        let successCount = 0;
        let errorCount = 0;

        for (const row of data as any[]) {
            try {
                // Map fields
                // Excel Headers:
                // Shipment no, Consignee, Exporter, Invoice no, Invoice # Items, Customs R Form, BL/AWB no, 
                // Container No, Container Type, CBM, G.W, No. of PKG, Clearing Status, Cleared Date, 
                // MACL, MPL, MCS, TRANSPORTATION, LINER

                const shipmentId = row['Shipment no'] || generateShipmentId();

                // Check if exists
                const existing = await pool.query('SELECT id FROM shipments WHERE shipment_id = $1', [shipmentId]);
                if (existing.rows.length > 0) {
                    console.log(`Skipping existing shipment: ${shipmentId}`);
                    continue;
                }

                const statusMap: { [key: string]: string } = {
                    'CLEARED': 'delivered', // Assuming cleared means done/delivered
                    'PENDING': 'created'
                };

                const status = statusMap[row['Clearing Status']] || 'created';

                // Parse dates
                // Note: Excel doesn't have pickup/delivery dates explicitly in the main view, 
                // so we'll default them to Cleared Date or Now
                const clearedDate = row['Cleared Date'] ? parseExcelDate(row['Cleared Date']) : new Date();

                // Construct insert query
                // We use direct SQL here to avoid dependency on the Model class which might not be fully reloaded/compiled in this script context
                const query = `
                    INSERT INTO shipments (
                        shipment_id, exporter_name, exporter_address, 
                        receiver_name, receiver_address, 
                        vendor_name, vendor_address,
                        item_description, weight, weight_unit, 
                        value, currency, 
                        pickup_date, expected_delivery_date, 
                        mode_of_transport, status, created_by,
                        invoice_no, invoice_item_count, customs_r_form, bl_awb_no,
                        container_no, container_type, cbm, gross_weight, package_count, cleared_date,
                        expense_macl, expense_mpl, expense_mcs, expense_transportation, expense_liner,
                        dimensions_unit
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27,
                        $28, $29, $30, $31, $32, $33
                    )
                `;

                const values = [
                    shipmentId,
                    row['Exporter '] || 'Unknown Exporter', // Note the space in Excel header
                    'Address Not Provided',
                    row['Consignee'] || 'Unknown Receiver',
                    'Address Not Provided',
                    'Unknown Vendor', // Vendor not in Excel
                    'Address Not Provided',
                    'General Cargo', // Description not in Excel
                    parseFloat(row['G.W']) || 0,
                    'kg',
                    0, // Value not in Excel
                    'USD',
                    clearedDate, // Pickup date default
                    clearedDate, // Delivery date default
                    'sea', // Default to sea as it mentions containers/BL
                    status,
                    adminId,
                    row['Invoice no'],
                    parseInt(row['Invoice # Items']) || 0,
                    row['Customs R Form'],
                    row['BL/AWB no'],
                    row['Container No'],
                    row['Container Type'],
                    parseFloat(row['CBM']) || 0,
                    parseFloat(row['G.W']) || 0,
                    row['No. of PKG'],
                    clearedDate,
                    parseFloat(row['MACL']) || 0,
                    parseFloat(row['MPL']) || 0,
                    parseFloat(row['MCS']) || 0,
                    parseFloat(row['TRANSPORTATION']) || 0,
                    parseFloat(row['LINER']) || 0,
                    'cm'
                ];

                await pool.query(query, values);
                console.log(`✅ Imported: ${shipmentId}`);
                successCount++;

            } catch (err) {
                console.error(`❌ Error importing row:`, row, err);
                errorCount++;
            }
        }

        console.log(`\nImport Summary:`);
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await pool.end();
    }
}

importShipments();
