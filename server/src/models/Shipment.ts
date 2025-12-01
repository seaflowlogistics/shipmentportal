import pool from '../config/database';

export interface Shipment {
    id: string;
    shipment_id: string;
    exporter_name: string;
    exporter_address: string;
    exporter_contact?: string;
    exporter_email?: string;
    vendor_name: string;
    vendor_address: string;
    vendor_contact?: string;
    vendor_email?: string;
    receiver_name: string;
    receiver_address: string;
    receiver_contact?: string;
    receiver_email?: string;
    item_description: string;
    weight: number;
    weight_unit: string;
    dimensions_length?: number;
    dimensions_width?: number;
    dimensions_height?: number;
    dimensions_unit: string;
    value: number;
    currency: string;
    pickup_date: Date;
    expected_delivery_date: Date;
    mode_of_transport: 'air' | 'sea' | 'road';
    status: 'new' | 'created' | 'approved' | 'rejected' | 'changes_requested' | 'in_transit' | 'delivered' | 'cancelled';
    rejection_reason?: string;
    created_by?: string;
    last_updated_by?: string;
    created_at: Date;
    updated_at: Date;
    // New fields
    invoice_no?: string;
    invoice_item_count?: number;
    customs_r_form?: string;
    bl_awb_no?: string;
    container_no?: string;
    container_type?: string;
    cbm?: number;
    gross_weight?: number;
    package_count?: string;
    cleared_date?: Date;
    expense_macl?: number;
    expense_mpl?: number;
    expense_mcs?: number;
    expense_transportation?: number;
    expense_liner?: number;
}

export interface CreateShipmentData {
    exporter_name: string;
    exporter_address: string;
    exporter_contact?: string;
    exporter_email?: string;
    vendor_name: string;
    vendor_address: string;
    vendor_contact?: string;
    vendor_email?: string;
    receiver_name: string;
    receiver_address: string;
    receiver_contact?: string;
    receiver_email?: string;
    item_description: string;
    weight: number;
    weight_unit?: string;
    dimensions_length?: number;
    dimensions_width?: number;
    dimensions_height?: number;
    dimensions_unit?: string;
    value: number;
    currency?: string;
    pickup_date: Date;
    expected_delivery_date: Date;
    mode_of_transport: 'air' | 'sea' | 'road';
    created_by: string;
    // New fields
    invoice_no?: string;
    invoice_item_count?: number;
    customs_r_form?: string;
    bl_awb_no?: string;
    container_no?: string;
    container_type?: string;
    cbm?: number;
    gross_weight?: number;
    package_count?: string;
    cleared_date?: Date;
    expense_macl?: number;
    expense_mpl?: number;
    expense_mcs?: number;
    expense_transportation?: number;
    expense_liner?: number;
}

export interface UpdateShipmentData {
    exporter_name?: string;
    exporter_address?: string;
    exporter_contact?: string;
    exporter_email?: string;
    vendor_name?: string;
    vendor_address?: string;
    vendor_contact?: string;
    vendor_email?: string;
    receiver_name?: string;
    receiver_address?: string;
    receiver_contact?: string;
    receiver_email?: string;
    item_description?: string;
    weight?: number;
    weight_unit?: string;
    dimensions_length?: number;
    dimensions_width?: number;
    dimensions_height?: number;
    dimensions_unit?: string;
    value?: number;
    currency?: string;
    pickup_date?: Date;
    expected_delivery_date?: Date;
    mode_of_transport?: 'air' | 'sea' | 'road';
    status?: string;
    rejection_reason?: string;
    last_updated_by?: string;
    // New fields
    invoice_no?: string;
    invoice_item_count?: number;
    customs_r_form?: string;
    bl_awb_no?: string;
    container_no?: string;
    container_type?: string;
    cbm?: number;
    gross_weight?: number;
    package_count?: string;
    cleared_date?: Date;
    expense_macl?: number;
    expense_mpl?: number;
    expense_mcs?: number;
    expense_transportation?: number;
    expense_liner?: number;
}

export class ShipmentModel {
    static async generateShipmentId(): Promise<string> {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        return `SHP-${dateStr}-${random}`;
    }

    static async findById(id: string): Promise<Shipment | null> {
        const result = await pool.query(
            'SELECT * FROM shipments WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    static async findByShipmentId(shipmentId: string): Promise<Shipment | null> {
        const result = await pool.query(
            'SELECT * FROM shipments WHERE shipment_id = $1',
            [shipmentId]
        );
        return result.rows[0] || null;
    }

    static async create(data: CreateShipmentData): Promise<Shipment> {
        const shipmentId = await this.generateShipmentId();
        const result = await pool.query(
            `INSERT INTO shipments (
                shipment_id, exporter_name, exporter_address, exporter_contact, exporter_email,
                vendor_name, vendor_address, vendor_contact, vendor_email,
                receiver_name, receiver_address, receiver_contact, receiver_email,
                item_description, weight, weight_unit, dimensions_length, dimensions_width, dimensions_height,
                dimensions_unit, value, currency, pickup_date, expected_delivery_date, mode_of_transport,
                created_by, status,
                invoice_no, invoice_item_count, customs_r_form, bl_awb_no, container_no, container_type,
                cbm, gross_weight, package_count, cleared_date,
                expense_macl, expense_mpl, expense_mcs, expense_transportation, expense_liner
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
                $20, $21, $22, $23, $24, $25, $26, $27,
                $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42
            ) RETURNING *`,
            [
                shipmentId,
                data.exporter_name,
                data.exporter_address,
                data.exporter_contact || null,
                data.exporter_email || null,
                data.vendor_name,
                data.vendor_address,
                data.vendor_contact || null,
                data.vendor_email || null,
                data.receiver_name,
                data.receiver_address,
                data.receiver_contact || null,
                data.receiver_email || null,
                data.item_description,
                data.weight,
                data.weight_unit || 'kg',
                data.dimensions_length || null,
                data.dimensions_width || null,
                data.dimensions_height || null,
                data.dimensions_unit || 'cm',
                data.value,
                data.currency || 'USD',
                data.pickup_date,
                data.expected_delivery_date,
                data.mode_of_transport,
                data.created_by,
                'created',
                data.invoice_no || null,
                data.invoice_item_count || null,
                data.customs_r_form || null,
                data.bl_awb_no || null,
                data.container_no || null,
                data.container_type || null,
                data.cbm || null,
                data.gross_weight || null,
                data.package_count || null,
                data.cleared_date || null,
                data.expense_macl || null,
                data.expense_mpl || null,
                data.expense_mcs || null,
                data.expense_transportation || null,
                data.expense_liner || null
            ]
        );
        return result.rows[0];
    }

    static async update(id: string, data: UpdateShipmentData): Promise<Shipment | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        const updateFields = [
            'exporter_name',
            'exporter_address',
            'exporter_contact',
            'exporter_email',
            'vendor_name',
            'vendor_address',
            'vendor_contact',
            'vendor_email',
            'receiver_name',
            'receiver_address',
            'receiver_contact',
            'receiver_email',
            'item_description',
            'weight',
            'weight_unit',
            'dimensions_length',
            'dimensions_width',
            'dimensions_height',
            'dimensions_unit',
            'value',
            'currency',
            'pickup_date',
            'expected_delivery_date',
            'mode_of_transport',
            'status',
            'rejection_reason',
            'last_updated_by',
            'invoice_no',
            'invoice_item_count',
            'customs_r_form',
            'bl_awb_no',
            'container_no',
            'container_type',
            'cbm',
            'gross_weight',
            'package_count',
            'cleared_date',
            'expense_macl',
            'expense_mpl',
            'expense_mcs',
            'expense_transportation',
            'expense_liner'
        ];

        for (const field of updateFields) {
            const dataKey = field as keyof UpdateShipmentData;
            if (data[dataKey] !== undefined) {
                fields.push(`${field} = $${paramCount++}`);
                values.push(data[dataKey]);
            }
        }

        // Always update updated_at timestamp (application-level for CockroachDB/PostgreSQL compatibility)
        fields.push(`updated_at = $${paramCount++}`);
        values.push(new Date());

        if (fields.length === 1) {
            // Only updated_at was set, nothing else to update
            return this.findById(id);
        }

        values.push(id);
        const query = `UPDATE shipments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    static async delete(id: string): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM shipments WHERE id = $1',
            [id]
        );
        return result.rowCount !== null && result.rowCount > 0;
    }

    static async findAll(filters?: {
        status?: string;
        createdBy?: string;
        mode?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ shipments: Shipment[]; total: number }> {
        let query = 'SELECT * FROM shipments WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) FROM shipments WHERE 1=1';
        const values: any[] = [];
        let paramCount = 1;

        if (filters?.status) {
            query += ` AND status = $${paramCount}`;
            countQuery += ` AND status = $${paramCount}`;
            values.push(filters.status);
            paramCount++;
        }

        if (filters?.createdBy) {
            query += ` AND created_by = $${paramCount}`;
            countQuery += ` AND created_by = $${paramCount}`;
            values.push(filters.createdBy);
            paramCount++;
        }

        if (filters?.mode) {
            query += ` AND mode_of_transport = $${paramCount}`;
            countQuery += ` AND mode_of_transport = $${paramCount}`;
            values.push(filters.mode);
            paramCount++;
        }

        if (filters?.search) {
            query += ` AND (shipment_id ILIKE $${paramCount} OR exporter_name ILIKE $${paramCount} OR receiver_name ILIKE $${paramCount})`;
            countQuery += ` AND (shipment_id ILIKE $${paramCount} OR exporter_name ILIKE $${paramCount} OR receiver_name ILIKE $${paramCount})`;
            values.push(`%${filters.search}%`);
            paramCount++;
        }

        query += ' ORDER BY created_at DESC';

        if (filters?.limit) {
            query += ` LIMIT $${paramCount}`;
            values.push(filters.limit);
            paramCount++;
        }

        if (filters?.offset) {
            query += ` OFFSET $${paramCount}`;
            values.push(filters.offset);
        }

        const [shipmentsResult, countResult] = await Promise.all([
            pool.query(query, values),
            pool.query(countQuery, values.slice(0, paramCount - (filters?.limit ? 2 : 1))),
        ]);

        return {
            shipments: shipmentsResult.rows,
            total: parseInt(countResult.rows[0].count),
        };
    }

    static async countByStatus(status: string): Promise<number> {
        const result = await pool.query(
            'SELECT COUNT(*) as count FROM shipments WHERE status = $1',
            [status]
        );
        return parseInt(result.rows[0].count);
    }

    static async getStatistics(userId?: string, dateFrom?: string, dateTo?: string): Promise<any> {
        let query = `
            SELECT
                COUNT(*) FILTER (WHERE status = 'created') as pending_approval,
                COUNT(*) FILTER (WHERE status = 'approved') as approved,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
                COUNT(*) FILTER (WHERE status = 'changes_requested') as changes_requested,
                COUNT(*) FILTER (WHERE status = 'in_transit') as in_transit,
                COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
                COUNT(*) as total
            FROM shipments
            WHERE 1=1
        `;
        const values: any[] = [];
        let paramCount = 1;

        if (userId) {
            query += ` AND created_by = $${paramCount}`;
            values.push(userId);
            paramCount++;
        }

        if (dateFrom) {
            query += ` AND DATE(pickup_date) >= $${paramCount}`;
            values.push(dateFrom);
            paramCount++;
        }

        if (dateTo) {
            query += ` AND DATE(pickup_date) <= $${paramCount}`;
            values.push(dateTo);
            paramCount++;
        }

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getRecentShipments(limit: number = 10, userId?: string, dateFrom?: string, dateTo?: string): Promise<Shipment[]> {
        let query = 'SELECT * FROM shipments WHERE 1=1';
        const values: any[] = [];
        let paramCount = 1;

        if (userId) {
            query += ` AND created_by = $${paramCount}`;
            values.push(userId);
            paramCount++;
        }

        if (dateFrom) {
            query += ` AND DATE(pickup_date) >= $${paramCount}`;
            values.push(dateFrom);
            paramCount++;
        }

        if (dateTo) {
            query += ` AND DATE(pickup_date) <= $${paramCount}`;
            values.push(dateTo);
            paramCount++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
        values.push(limit);

        const result = await pool.query(query, values);
        return result.rows;
    }
}
