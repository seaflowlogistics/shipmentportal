import { Router } from 'express';
import {
    createShipment,
    getShipmentById,
    updateShipment,
    deleteShipment,
    listShipments,
    getStatistics,
    approveShipment,
    rejectShipment,
    requestChanges
} from '../controllers/shipments.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All shipment routes require authentication
router.use(authenticate);

// List shipments (all authenticated users)
router.get('/', listShipments);

// Get statistics (all authenticated users)
router.get('/stats/dashboard', getStatistics);

// Create shipment (ClearanceManager only)
router.post('/', (req, res, next): void => {
    const user = (req as any).user;
    if (user.role !== 'clearance_manager') {
        res.status(403).json({ error: 'Only clearance managers can create shipments' });
        return;
    }
    next();
}, createShipment);

// Get shipment by ID (all authenticated users)
router.get('/:id', getShipmentById);

// Update shipment (Creator, Accounts, Admin)
router.put('/:id', updateShipment);

// Delete shipment (Admin only)
router.delete('/:id', (req, res, next): void => {
    const user = (req as any).user;
    if (user.role !== 'admin') {
        res.status(403).json({ error: 'Only admins can delete shipments' });
        return;
    }
    next();
}, deleteShipment);

// Approve shipment (Accounts only)
router.post('/:id/approve', (req, res, next): void => {
    const user = (req as any).user;
    if (user.role !== 'accounts') {
        res.status(403).json({ error: 'Only accounts managers can approve shipments' });
        return;
    }
    next();
}, approveShipment);

// Reject shipment (Accounts only)
router.post('/:id/reject', (req, res, next): void => {
    const user = (req as any).user;
    if (user.role !== 'accounts') {
        res.status(403).json({ error: 'Only accounts managers can reject shipments' });
        return;
    }
    next();
}, rejectShipment);

// Request changes (Accounts only)
router.post('/:id/request-changes', (req, res, next): void => {
    const user = (req as any).user;
    if (user.role !== 'accounts') {
        res.status(403).json({ error: 'Only accounts managers can request changes' });
        return;
    }
    next();
}, requestChanges);

export default router;
