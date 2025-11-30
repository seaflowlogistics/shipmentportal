import pool from '../config/database';

let poolClosed = false;

// Setup for all tests
beforeAll(async () => {
    // Run migrations before tests
    console.log('Setting up test database...');
});

afterAll(async () => {
    // Close database connection after all tests (only once)
    if (!poolClosed) {
        try {
            await pool.end();
            poolClosed = true;
            console.log('Test database connection closed');
        } catch (error) {
            // Pool might already be closed
        }
    }
});

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('listen EADDRINUSE') ||
                args[0].includes('Cannot set headers after they are sent'))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
