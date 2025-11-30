import pool from '../config/database';
import { hashPassword } from '../utils/password';

/**
 * Test user creation helper
 */
export async function createTestUser(data: {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'accounts' | 'clearance_manager';
    fullName?: string;
}) {
    const passwordHash = await hashPassword(data.password);
    // Delete existing user with same username to avoid conflicts
    await pool.query('DELETE FROM users WHERE username = $1', [data.username]);

    const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, role, full_name, is_active, must_change_password)
         VALUES ($1, $2, $3, $4, $5, true, false)
         RETURNING id, username, email, role`,
        [data.username, data.email, passwordHash, data.role, data.fullName || data.username]
    );
    return result.rows[0];
}

/**
 * Create test shipment
 */
export async function createTestShipment(data: {
    createdBy: string;
    exporterName?: string;
    exporterAddress?: string;
    exporterContact?: string;
    exporterEmail?: string;
    vendorName?: string;
    vendorAddress?: string;
    vendorContact?: string;
    vendorEmail?: string;
    receiverName?: string;
    receiverAddress?: string;
    receiverContact?: string;
    receiverEmail?: string;
    itemDescription?: string;
    weight?: number;
    weightUnit?: string;
    dimensionsLength?: number;
    dimensionsWidth?: number;
    dimensionsHeight?: number;
    dimensionsUnit?: string;
    value?: number;
    currency?: string;
    pickupDate?: string;
    expectedDeliveryDate?: string;
    modeOfTransport?: string;
    status?: string;
}) {
    const shipmentId = `SHIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const pickupDate = data.pickupDate || new Date().toISOString().split('T')[0];
    const deliveryDate = data.expectedDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const result = await pool.query(
        `INSERT INTO shipments (
            shipment_id, exporter_name, exporter_address, exporter_contact, exporter_email,
            vendor_name, vendor_address, vendor_contact, vendor_email,
            receiver_name, receiver_address, receiver_contact, receiver_email,
            item_description, weight, weight_unit, dimensions_length, dimensions_width, dimensions_height, dimensions_unit,
            value, currency, pickup_date, expected_delivery_date, mode_of_transport, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
         RETURNING *`,
        [
            shipmentId,
            data.exporterName || 'Test Exporter',
            data.exporterAddress || 'Test Address',
            data.exporterContact || 'test@exporter.com',
            data.exporterEmail || 'test@exporter.com',
            data.vendorName || 'Test Vendor',
            data.vendorAddress || 'Vendor Address',
            data.vendorContact || '+1234567890',
            data.vendorEmail || 'vendor@test.com',
            data.receiverName || 'Test Receiver',
            data.receiverAddress || 'Receiver Address',
            data.receiverContact || '+1234567890',
            data.receiverEmail || 'receiver@test.com',
            data.itemDescription || 'Test Item',
            data.weight || 100,
            data.weightUnit || 'kg',
            data.dimensionsLength || 100,
            data.dimensionsWidth || 100,
            data.dimensionsHeight || 100,
            data.dimensionsUnit || 'cm',
            data.value || 5000,
            data.currency || 'USD',
            pickupDate,
            deliveryDate,
            data.modeOfTransport || 'sea',
            data.status || 'created',
            data.createdBy,
        ]
    );
    return result.rows[0];
}

/**
 * Clean up test data
 */
export async function cleanupTestData() {
    // Delete in order of foreign key dependencies
    await pool.query('DELETE FROM documents');
    await pool.query('DELETE FROM audit_logs');
    await pool.query('DELETE FROM refresh_tokens');
    await pool.query('DELETE FROM password_reset_tokens');
    await pool.query('DELETE FROM shipments');
    // Keep admin user but delete test users
    await pool.query("DELETE FROM users WHERE username NOT IN ('admin')");
}

/**
 * Get test user data
 */
export const testUsers = {
    admin: {
        username: 'admin',
        password: 'Admin@123',
        email: 'admin@shipmentportal.com',
        role: 'admin' as const,
    },
    accounts: {
        username: 'accounts1',
        password: 'Password@123',
        email: 'accounts1@test.com',
        role: 'accounts' as const,
    },
    clearance: {
        username: 'clearance1',
        password: 'Password@123',
        email: 'clearance1@test.com',
        role: 'clearance_manager' as const,
    },
};

/**
 * Wait for async operations
 */
export async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
