import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import shipmentsRoutes from './routes/shipments.routes';
import documentsRoutes from './routes/documents.routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { appConfig } from './config/auth';

const app: Application = express();

// Middleware
app.use(cors({
    origin: appConfig.frontendUrl,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/shipments', shipmentsRoutes);
app.use('/api/documents', documentsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
