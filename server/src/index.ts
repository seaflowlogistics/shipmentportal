import app from './app';
import pool from './config/database';
import { appConfig } from './config/auth';

const startServer = async () => {
    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connection established');

        // Start server
        app.listen(appConfig.port, () => {
            console.log(`🚀 Server running on port ${appConfig.port}`);
            console.log(`📝 Environment: ${appConfig.nodeEnv}`);
            console.log(`🌐 Frontend URL: ${appConfig.frontendUrl}`);
            console.log(`\n📍 API Endpoints:`);
            console.log(`   - POST   /api/auth/login`);
            console.log(`   - POST   /api/auth/logout`);
            console.log(`   - POST   /api/auth/refresh`);
            console.log(`   - POST   /api/auth/forgot-password`);
            console.log(`   - POST   /api/auth/reset-password`);
            console.log(`   - POST   /api/auth/change-password`);
            console.log(`   - GET    /api/auth/me`);
            console.log(`   - GET    /api/users`);
            console.log(`   - POST   /api/users`);
            console.log(`   - PUT    /api/users/:id`);
            console.log(`   - DELETE /api/users/:id`);
            console.log(`   - POST   /api/users/:id/reset-password`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

startServer();
