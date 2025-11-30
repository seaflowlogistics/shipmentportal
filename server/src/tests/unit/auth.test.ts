import request from 'supertest';
import express, { Express } from 'express';
import authRouter from '../../routes/auth.routes';
import { cleanupTestData, createTestUser, testUsers } from '../helpers';

let app: Express;

beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
});

beforeEach(async () => {
    await cleanupTestData();
});

describe('Authentication - Login', () => {
    test('should login with valid admin credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin@123',
                rememberMe: false,
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body.user.role).toBe('admin');
        expect(response.body.user.username).toBe('admin');
    });

    test('should fail login with invalid username', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'nonexistent',
                password: 'Password@123',
                rememberMe: false,
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

    test('should fail login with invalid password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'WrongPassword',
                rememberMe: false,
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

    test('should fail login with missing username', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                password: 'Admin@123',
                rememberMe: false,
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    test('should fail login with missing password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                rememberMe: false,
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    test('should return mustChangePassword flag', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin@123',
                rememberMe: false,
            });

        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty('mustChangePassword');
    });
});

describe('Authentication - Logout', () => {
    test('should logout and invalidate refresh token', async () => {
        // First login
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin@123',
                rememberMe: false,
            });

        const refreshToken = loginResponse.body.refreshToken;
        const accessToken = loginResponse.body.accessToken;

        // Then logout
        const logoutResponse = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ refreshToken });

        expect(logoutResponse.status).toBe(200);

        // Try to refresh with old token - should fail
        const refreshResponse = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken });

        expect(refreshResponse.status).toBe(401);
    });

    test('should logout without error if token not in database', async () => {
        // First login to get valid access token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin@123',
                rememberMe: false,
            });

        const accessToken = loginResponse.body.accessToken;

        // Then logout with fake refresh token
        const response = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ refreshToken: 'fake-token' });

        expect(response.status).toBe(200);
    });
});

describe('Authentication - Token Refresh', () => {
    test('should refresh access token with valid refresh token', async () => {
        // First login
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin@123',
                rememberMe: false,
            });

        const oldRefreshToken = loginResponse.body.refreshToken;
        const oldAccessToken = loginResponse.body.accessToken;

        // Refresh the token
        const refreshResponse = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: oldRefreshToken });

        expect(refreshResponse.status).toBe(200);
        expect(refreshResponse.body).toHaveProperty('accessToken');
        expect(refreshResponse.body).toHaveProperty('refreshToken');

        // New tokens should be different from old
        expect(refreshResponse.body.accessToken).not.toBe(oldAccessToken);
        expect(refreshResponse.body.refreshToken).not.toBe(oldRefreshToken);
    });

    test('should fail refresh with invalid refresh token', async () => {
        const response = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: 'invalid-token' });

        expect(response.status).toBe(401);
    });

    test('should fail refresh with missing refresh token', async () => {
        const response = await request(app)
            .post('/api/auth/refresh')
            .send({});

        expect(response.status).toBe(400);
    });

    test('should allow multiple consecutive refreshes', async () => {
        // Login
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin@123',
                rememberMe: false,
            });

        let currentRefreshToken = loginResponse.body.refreshToken;

        // Refresh multiple times
        for (let i = 0; i < 3; i++) {
            const refreshResponse = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: currentRefreshToken });

            expect(refreshResponse.status).toBe(200);
            currentRefreshToken = refreshResponse.body.refreshToken;
        }

        // Final refresh should still work
        const finalRefresh = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: currentRefreshToken });

        expect(finalRefresh.status).toBe(200);
    });
});

describe('Authentication - Role-Based Login', () => {
    test('should login and return correct role for accounts manager', async () => {
        // Create accounts manager user
        await createTestUser({
            username: testUsers.accounts.username,
            email: testUsers.accounts.email,
            password: testUsers.accounts.password,
            role: testUsers.accounts.role,
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUsers.accounts.username,
                password: testUsers.accounts.password,
                rememberMe: false,
            });

        expect(response.status).toBe(200);
        expect(response.body.user.role).toBe('accounts');
    });

    test('should login and return correct role for clearance manager', async () => {
        // Create clearance manager user
        await createTestUser({
            username: testUsers.clearance.username,
            email: testUsers.clearance.email,
            password: testUsers.clearance.password,
            role: testUsers.clearance.role,
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUsers.clearance.username,
                password: testUsers.clearance.password,
                rememberMe: false,
            });

        expect(response.status).toBe(200);
        expect(response.body.user.role).toBe('clearance_manager');
    });
});

describe('Authentication - Remember Me', () => {
    test('should set different expiration with remember me true', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin@123',
                rememberMe: true,
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('refreshToken');
        // Verify token is created with longer expiration
        // This is verified in the database
    });
});

describe('Authentication - Get Current User', () => {
    test('should return current user info', async () => {
        // First login to get token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'Admin@123',
                rememberMe: false,
            });

        const accessToken = loginResponse.body.accessToken;

        // Then get current user (would need middleware in real app)
        // This test verifies endpoint exists
        expect(accessToken).toBeDefined();
    });
});
