import request from 'supertest';
import express, { Express } from 'express';
import shipmentsRouter from '../../routes/shipments.routes';
import usersRouter from '../../routes/users.routes';
import auditLogsRouter from '../../routes/audit.routes';
import authRouter from '../../routes/auth.routes';
import { authenticate } from '../../middleware/auth.middleware';
import { cleanupTestData, createTestUser, testUsers } from '../helpers';

let app: Express;
let adminToken: string;
let accountsToken: string;
let clearanceToken: string;

beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
    app.use('/api/shipments', authenticate, shipmentsRouter);
    app.use('/api/users', authenticate, usersRouter);
    app.use('/api/audit-logs', authenticate, auditLogsRouter);
});

beforeEach(async () => {
    await cleanupTestData();

    // Create test users and get tokens
    await createTestUser({
        username: testUsers.admin.username,
        email: 'admin-test@test.com',
        password: testUsers.admin.password,
        role: testUsers.admin.role,
    });

    const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
            username: testUsers.admin.username,
            password: testUsers.admin.password,
        });
    adminToken = adminLogin.body.accessToken;

    await createTestUser({
        username: testUsers.accounts.username,
        email: testUsers.accounts.email,
        password: testUsers.accounts.password,
        role: testUsers.accounts.role,
    });

    const accountsLogin = await request(app)
        .post('/api/auth/login')
        .send({
            username: testUsers.accounts.username,
            password: testUsers.accounts.password,
        });
    accountsToken = accountsLogin.body.accessToken;

    await createTestUser({
        username: testUsers.clearance.username,
        email: testUsers.clearance.email,
        password: testUsers.clearance.password,
        role: testUsers.clearance.role,
    });

    const clearanceLogin = await request(app)
        .post('/api/auth/login')
        .send({
            username: testUsers.clearance.username,
            password: testUsers.clearance.password,
        });
    clearanceToken = clearanceLogin.body.accessToken;
});

describe('RBAC - Shipment Access', () => {
    test('Admin can view all shipments', async () => {
        const response = await request(app)
            .get('/api/shipments')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.shipments)).toBe(true);
    });

    test('Accounts Manager can view all shipments', async () => {
        const response = await request(app)
            .get('/api/shipments')
            .set('Authorization', `Bearer ${accountsToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.shipments)).toBe(true);
    });

    test('ClearanceAgent can only view own shipments', async () => {
        // Create shipment by another user
        await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                exporter_name: 'Other User Exporter',
                exporter_address: 'Address',
                vendor_name: 'Vendor',
                vendor_address: 'Vendor Address',
                receiver_name: 'Receiver',
                receiver_address: 'Receiver Address',
                item_description: 'Test Item',
                weight: 100,
                value: 5000,
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'sea',
            });

        // ClearanceManager lists shipments
        const response = await request(app)
            .get('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken}`);

        expect(response.status).toBe(200);
        // Should be empty since ClearanceAgent created none
        expect(response.body.shipments.length).toBe(0);
    });
});

describe('RBAC - Shipment Creation', () => {
    test('Admin can create shipments', async () => {
        const response = await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                exporter_name: 'Test Exporter',
                exporter_address: 'Address',
                vendor_name: 'Vendor',
                vendor_address: 'Vendor Address',
                receiver_name: 'Receiver',
                receiver_address: 'Receiver Address',
                item_description: 'Test Item',
                weight: 100,
                value: 5000,
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'sea',
            });

        expect(response.status).toBe(201);
        expect(response.body.shipment).toHaveProperty('id');
        expect(response.body.shipment).toHaveProperty('shipment_id');
    });

    test('ClearanceAgent can create shipments', async () => {
        const response = await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken}`)
            .send({
                exporter_name: 'Test Exporter',
                exporter_address: 'Address',
                vendor_name: 'Vendor',
                vendor_address: 'Vendor Address',
                receiver_name: 'Receiver',
                receiver_address: 'Receiver Address',
                item_description: 'Test Item',
                weight: 100,
                value: 5000,
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'air',
            });

        expect(response.status).toBe(201);
    });

    test('Accounts Manager CANNOT create shipments', async () => {
        const response = await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${accountsToken}`)
            .send({
                exporter_name: 'Test Exporter',
                exporter_address: 'Address',
                vendor_name: 'Vendor',
                vendor_address: 'Vendor Address',
                receiver_name: 'Receiver',
                receiver_address: 'Receiver Address',
                item_description: 'Test Item',
                weight: 100,
                value: 5000,
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'road',
            });

        expect(response.status).toBe(403);
    });
});

describe('RBAC - Approval Actions', () => {
    let shipmentId: string;

    beforeEach(async () => {
        // Create a shipment as clearance manager
        const createResponse = await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken}`)
            .send({
                exporter_name: 'Test Exporter',
                exporter_address: 'Address',
                vendor_name: 'Vendor',
                vendor_address: 'Vendor Address',
                receiver_name: 'Receiver',
                receiver_address: 'Receiver Address',
                item_description: 'Test Item',
                weight: 100,
                value: 5000,
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'sea',
            });
        shipmentId = createResponse.body.shipment.id;
    });

    test('Accounts Manager can approve shipment', async () => {
        const response = await request(app)
            .post(`/api/shipments/${shipmentId}/approve`)
            .set('Authorization', `Bearer ${accountsToken}`);

        expect(response.status).toBe(200);
        expect(response.body.shipment.status).toBe('approved');
    });

    test('Accounts Manager can reject shipment', async () => {
        const response = await request(app)
            .post(`/api/shipments/${shipmentId}/reject`)
            .set('Authorization', `Bearer ${accountsToken}`)
            .send({ reason: 'Test rejection' });

        expect(response.status).toBe(200);
        expect(response.body.shipment.status).toBe('rejected');
        expect(response.body.shipment.rejection_reason).toBe('Test rejection');
    });

    test('Accounts Manager can request changes', async () => {
        const response = await request(app)
            .post(`/api/shipments/${shipmentId}/request-changes`)
            .set('Authorization', `Bearer ${accountsToken}`)
            .send({ message: 'Please update details' });

        expect(response.status).toBe(200);
        expect(response.body.shipment.status).toBe('changes_requested');
    });

    test('Admin CANNOT approve/reject shipments', async () => {
        const response = await request(app)
            .post(`/api/shipments/${shipmentId}/approve`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(403);
    });

    test('ClearanceAgent CANNOT approve shipments', async () => {
        const response = await request(app)
            .post(`/api/shipments/${shipmentId}/approve`)
            .set('Authorization', `Bearer ${clearanceToken}`);

        expect(response.status).toBe(403);
    });
});

describe('RBAC - User Management', () => {
    test('Admin can create users', async () => {
        const response = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                username: 'newuser',
                email: 'newuser@test.com',
                fullName: 'New User',
                role: 'accounts',
                password: 'Password@123',
            });

        expect(response.status).toBe(201);
        expect(response.body.user.username).toBe('newuser');
    });

    test('Admin can delete users', async () => {
        // First create a user
        const createResponse = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                username: 'usertoDelete',
                email: 'delete@test.com',
                fullName: 'Delete User',
                role: 'accounts',
                password: 'Password@123',
            });

        const userId = createResponse.body.user.id;

        // Then delete
        const deleteResponse = await request(app)
            .delete(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(deleteResponse.status).toBe(200);
    });

    test('Accounts Manager CANNOT create users', async () => {
        const response = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${accountsToken}`)
            .send({
                username: 'newuser',
                email: 'newuser@test.com',
                role: 'accounts',
                password: 'Password@123',
            });

        expect(response.status).toBe(403);
    });

    test('ClearanceAgent CANNOT create users', async () => {
        const response = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${clearanceToken}`)
            .send({
                username: 'newuser',
                email: 'newuser@test.com',
                role: 'accounts',
                password: 'Password@123',
            });

        expect(response.status).toBe(403);
    });
});

describe('RBAC - Audit Logs', () => {
    test('Admin can view audit logs', async () => {
        const response = await request(app)
            .get('/api/audit-logs')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.logs)).toBe(true);
    });

    test('Accounts Manager CANNOT view audit logs', async () => {
        const response = await request(app)
            .get('/api/audit-logs')
            .set('Authorization', `Bearer ${accountsToken}`);

        expect(response.status).toBe(403);
    });

    test('ClearanceAgent CANNOT view audit logs', async () => {
        const response = await request(app)
            .get('/api/audit-logs')
            .set('Authorization', `Bearer ${clearanceToken}`);

        expect(response.status).toBe(403);
    });
});
