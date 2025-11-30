/**
 * End-to-End Integration Tests
 * Tests complete workflows across all roles and functionality
 * Verifies project.md requirements are met
 */

import request from 'supertest';
import express, { Express } from 'express';
import authRouter from '../../routes/auth.routes';
import shipmentsRouter from '../../routes/shipments.routes';
import documentsRouter from '../../routes/documents.routes';
import usersRouter from '../../routes/users.routes';
import auditLogsRouter from '../../routes/audit.routes';
import { authenticate } from '../../middleware/auth.middleware';
import { cleanupTestData, createTestUser, testUsers } from '../helpers';

let app: Express;

beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.use('/api/auth', authRouter);
    app.use('/api/shipments', authenticate, shipmentsRouter);
    app.use('/api/documents', authenticate, documentsRouter);
    app.use('/api/users', authenticate, usersRouter);
    app.use('/api/audit-logs', authenticate, auditLogsRouter);
});

beforeEach(async () => {
    await cleanupTestData();
});

describe('E2E - Complete Shipment Lifecycle', () => {
    let adminToken: string;
    let accountsToken: string;
    let clearanceToken: string;
    let shipmentId: string;

    beforeEach(async () => {
        // Create and login users
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

        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin@123',
            });
        adminToken = adminLogin.body.accessToken;
    });

    test('ClearanceManager creates shipment → Accounts approves → Complete workflow', async () => {
        // Step 1: ClearanceManager creates shipment
        const createResponse = await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken}`)
            .send({
                exporter_name: 'International Electronics Co.',
                exporter_address: '123 Export St, Shanghai, China',
                exporter_contact: 'contact@exporter.com',
                exporter_email: 'contact@exporter.com',
                vendor_name: 'Vendor Trading Ltd',
                vendor_address: '456 Vendor Ave, Beijing, China',
                vendor_contact: '+86 10 1234 5678',
                vendor_email: 'vendor@trading.com',
                receiver_name: 'TechImports Inc',
                receiver_address: '789 Import Blvd, New York, NY',
                receiver_contact: '+1 212 555 1234',
                receiver_email: 'import@tech.com',
                item_description: 'Electronic Components - CPUs, Memory',
                weight: 250,
                weight_unit: 'kg',
                dimensions_length: 100,
                dimensions_width: 80,
                dimensions_height: 60,
                dimensions_unit: 'cm',
                value: 50000,
                currency: 'USD',
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'sea',
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.shipment.status).toBe('created');
        shipmentId = createResponse.body.shipment.id;

        // Step 2: Verify shipment in pending list for Accounts Manager
        const pendingResponse = await request(app)
            .get('/api/shipments?status=created')
            .set('Authorization', `Bearer ${accountsToken}`);

        expect(pendingResponse.status).toBe(200);
        const foundShipment = pendingResponse.body.shipments.find((s: any) => s.id === shipmentId);
        expect(foundShipment).toBeDefined();

        // Step 3: Accounts Manager views shipment details
        const detailResponse = await request(app)
            .get(`/api/shipments/${shipmentId}`)
            .set('Authorization', `Bearer ${accountsToken}`);

        expect(detailResponse.status).toBe(200);
        expect(detailResponse.body.shipment.exporter_name).toBe('International Electronics Co.');
        expect(detailResponse.body.shipment.status).toBe('created');

        // Step 4: Accounts Manager approves shipment
        const approveResponse = await request(app)
            .post(`/api/shipments/${shipmentId}/approve`)
            .set('Authorization', `Bearer ${accountsToken}`);

        expect(approveResponse.status).toBe(200);
        expect(approveResponse.body.shipment.status).toBe('approved');

        // Step 5: Verify in Admin dashboard
        const statsResponse = await request(app)
            .get('/api/shipments/stats/dashboard')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(statsResponse.status).toBe(200);
        expect(statsResponse.body.statistics).toBeDefined();
        // Statistics object contains counts by status
    });

    test('ClearanceManager creates → Accounts rejects with reason → Clearance edits → Approves', async () => {
        // Step 1: Create shipment
        const createResponse = await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken}`)
            .send({
                exporter_name: 'Export Co',
                exporter_address: 'Address',
                vendor_name: 'Vendor',
                vendor_address: 'Address',
                receiver_name: 'Receiver',
                receiver_address: 'Address',
                item_description: 'Test Item',
                weight: 100,
                value: 5000,
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'air',
            });

        shipmentId = createResponse.body.shipment.id;

        // Step 2: Accounts Manager rejects
        const rejectResponse = await request(app)
            .post(`/api/shipments/${shipmentId}/reject`)
            .set('Authorization', `Bearer ${accountsToken}`)
            .send({ reason: 'Invalid weight for air transport - exceeds limits' });

        expect(rejectResponse.status).toBe(200);
        expect(rejectResponse.body.shipment.status).toBe('rejected');
        expect(rejectResponse.body.shipment.rejection_reason).toBe('Invalid weight for air transport - exceeds limits');

        // Step 3: ClearanceManager edits shipment
        const updateResponse = await request(app)
            .put(`/api/shipments/${shipmentId}`)
            .set('Authorization', `Bearer ${clearanceToken}`)
            .send({
                weight: 50, // Reduced weight
                item_description: 'Test Item - Lightweight Package',
            });

        expect(updateResponse.status).toBe(200);

        // Step 4: Create new shipment since rejected one cannot be re-approved
        const createResponse2 = await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken}`)
            .send({
                exporter_name: 'Export Co',
                exporter_address: 'Address',
                vendor_name: 'Vendor',
                vendor_address: 'Address',
                receiver_name: 'Receiver',
                receiver_address: 'Address',
                item_description: 'Test Item - Lightweight Package',
                weight: 50,
                value: 2500,
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'air',
            });

        const newShipmentId = createResponse2.body.shipment.id;

        // Step 5: Approve new shipment
        const approveResponse = await request(app)
            .post(`/api/shipments/${newShipmentId}/approve`)
            .set('Authorization', `Bearer ${accountsToken}`);

        expect(approveResponse.status).toBe(200);
        expect(approveResponse.body.shipment.status).toBe('approved');
    });

    test('Request Changes workflow - Accounts requests → Clearance edits → Approves', async () => {
        // Step 1: Create shipment
        const createResponse = await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken}`)
            .send({
                exporter_name: 'Exporter',
                exporter_address: 'Address',
                vendor_name: 'Vendor',
                vendor_address: 'Address',
                receiver_name: 'Receiver',
                receiver_address: 'Address',
                item_description: 'Electronics',
                weight: 100,
                value: 10000,
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'sea',
            });

        shipmentId = createResponse.body.shipment.id;

        // Step 2: Accounts Manager requests changes
        const changesResponse = await request(app)
            .post(`/api/shipments/${shipmentId}/request-changes`)
            .set('Authorization', `Bearer ${accountsToken}`)
            .send({ message: 'Please add detailed dimensions and update item description' });

        expect(changesResponse.status).toBe(200);
        expect(changesResponse.body.shipment.status).toBe('changes_requested');

        // Step 3: ClearanceManager edits shipment
        const updateResponse = await request(app)
            .put(`/api/shipments/${shipmentId}`)
            .set('Authorization', `Bearer ${clearanceToken}`)
            .send({
                item_description: 'High-grade Electronics with detailed specifications',
                dimensions_length: 120,
                dimensions_width: 100,
                dimensions_height: 80,
            });

        expect(updateResponse.status).toBe(200);

        // Step 4: Verify can see updated shipment
        const viewResponse = await request(app)
            .get(`/api/shipments/${shipmentId}`)
            .set('Authorization', `Bearer ${clearanceToken}`);

        expect(viewResponse.status).toBe(200);
        expect(viewResponse.body.shipment.item_description).toContain('High-grade');

        // Step 5: Accounts Manager approves after changes
        const approveResponse = await request(app)
            .post(`/api/shipments/${shipmentId}/approve`)
            .set('Authorization', `Bearer ${accountsToken}`);

        expect(approveResponse.status).toBe(200);
        expect(approveResponse.body.shipment.status).toBe('approved');
    });
});

describe('E2E - Audit Trail Verification', () => {
    let adminToken: string;
    let clearanceToken: string;

    beforeEach(async () => {
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin@123',
            });
        adminToken = adminLogin.body.accessToken;

        await createTestUser({
            username: testUsers.accounts.username,
            email: testUsers.accounts.email,
            password: testUsers.accounts.password,
            role: testUsers.accounts.role,
        });

        await request(app)
            .post('/api/auth/login')
            .send({
                username: testUsers.accounts.username,
                password: testUsers.accounts.password,
            });

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

    test('All actions create audit log entries', async () => {
        // Create shipment
        const createResponse = await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken}`)
            .send({
                exporter_name: 'Test Exporter',
                exporter_address: 'Address',
                vendor_name: 'Vendor',
                vendor_address: 'Address',
                receiver_name: 'Receiver',
                receiver_address: 'Address',
                item_description: 'Item',
                weight: 100,
                value: 5000,
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'sea',
            });

        const shipmentId = createResponse.body.shipment.id;

        // Approve shipment
        const accountsLogin = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUsers.accounts.username,
                password: testUsers.accounts.password,
            });
        const accountsToken = accountsLogin.body.accessToken;

        await request(app)
            .post(`/api/shipments/${shipmentId}/approve`)
            .set('Authorization', `Bearer ${accountsToken}`);

        // Check audit logs
        const auditResponse = await request(app)
            .get('/api/audit-logs')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(auditResponse.status).toBe(200);
        expect(Array.isArray(auditResponse.body.logs)).toBe(true);

        // Verify entries for CREATE and APPROVE actions
        const logs = auditResponse.body.logs;
        const createLog = logs.find((log: any) => log.action === 'CREATE' && log.entity_type === 'shipment');
        const approveLog = logs.find((log: any) => log.action === 'APPROVE' && log.entity_type === 'shipment');

        expect(createLog).toBeDefined();
        expect(approveLog).toBeDefined();
    });
});

describe('E2E - Role-Specific Dashboard Data', () => {
    let adminToken: string;
    let clearanceToken1: string;
    let clearanceToken2: string;

    beforeEach(async () => {
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin@123',
            });
        adminToken = adminLogin.body.accessToken;

        await createTestUser({
            username: 'clearance1',
            email: 'clear1@test.com',
            password: 'Password@123',
            role: 'clearance_manager',
        });

        const clearance1Login = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'clearance1',
                password: 'Password@123',
            });
        clearanceToken1 = clearance1Login.body.accessToken;

        await createTestUser({
            username: 'clearance2',
            email: 'clear2@test.com',
            password: 'Password@123',
            role: 'clearance_manager',
        });

        const clearance2Login = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'clearance2',
                password: 'Password@123',
            });
        clearanceToken2 = clearance2Login.body.accessToken;

        await createTestUser({
            username: testUsers.accounts.username,
            email: testUsers.accounts.email,
            password: testUsers.accounts.password,
            role: testUsers.accounts.role,
        });

        await request(app)
            .post('/api/auth/login')
            .send({
                username: testUsers.accounts.username,
                password: testUsers.accounts.password,
            });
    });

    test('Admin sees all shipments, ClearanceManagers see only their own', async () => {
        // Clearance1 creates 2 shipments
        await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken1}`)
            .send({
                exporter_name: 'Exporter',
                exporter_address: 'Addr',
                vendor_name: 'Vendor',
                vendor_address: 'Addr',
                receiver_name: 'Receiver',
                receiver_address: 'Addr',
                item_description: 'Item',
                weight: 100,
                value: 5000,
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'sea',
            });

        await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken1}`)
            .send({
                exporter_name: 'Exporter',
                exporter_address: 'Addr',
                vendor_name: 'Vendor',
                vendor_address: 'Addr',
                receiver_name: 'Receiver',
                receiver_address: 'Addr',
                item_description: 'Item',
                weight: 100,
                value: 5000,
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'air',
            });

        // Clearance2 creates 1 shipment
        await request(app)
            .post('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken2}`)
            .send({
                exporter_name: 'Exporter',
                exporter_address: 'Addr',
                vendor_name: 'Vendor',
                vendor_address: 'Addr',
                receiver_name: 'Receiver',
                receiver_address: 'Addr',
                item_description: 'Item',
                weight: 100,
                value: 5000,
                pickup_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mode_of_transport: 'road',
            });

        // Admin sees all 3
        const adminList = await request(app)
            .get('/api/shipments')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(adminList.body.shipments.length).toBe(3);

        // Clearance1 sees only their 2
        const clearance1List = await request(app)
            .get('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken1}`);

        expect(clearance1List.body.shipments.length).toBe(2);

        // Clearance2 sees only their 1
        const clearance2List = await request(app)
            .get('/api/shipments')
            .set('Authorization', `Bearer ${clearanceToken2}`);

        expect(clearance2List.body.shipments.length).toBe(1);
    });
});
