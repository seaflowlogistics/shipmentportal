import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ShipmentModel, CreateShipmentData, UpdateShipmentData } from '../models/Shipment';
import { DocumentModel } from '../models/Document';
import { UserModel } from '../models/User';
import { createAuditLog } from '../utils/auditLog';
import { deleteUploadedFile } from '../middleware/upload.middleware';
import { emailService } from '../services/email.service';
import { validateShipmentDocuments } from '../utils/documentValidation';

// Create Shipment
export const createShipment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            exporter_name,
            exporter_address,
            exporter_contact,
            exporter_email,
            vendor_name,
            vendor_address,
            vendor_contact,
            vendor_email,
            receiver_name,
            receiver_address,
            receiver_contact,
            receiver_email,
            item_description,
            weight,
            weight_unit,
            dimensions_length,
            dimensions_width,
            dimensions_height,
            dimensions_unit,
            value,
            currency,
            pickup_date,
            expected_delivery_date,
            mode_of_transport
        } = req.body;

        // Validation
        const requiredFields = [
            'exporter_name',
            'exporter_address',
            'vendor_name',
            'vendor_address',
            'receiver_name',
            'receiver_address',
            'item_description',
            'weight',
            'value',
            'pickup_date',
            'expected_delivery_date',
            'mode_of_transport'
        ];

        const missing = requiredFields.filter(field => !req.body[field]);
        if (missing.length > 0) {
            res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
            return;
        }

        // Validate dates
        const pickup = new Date(pickup_date);
        const delivery = new Date(expected_delivery_date);
        if (pickup > delivery) {
            res.status(400).json({ error: 'Pickup date must be before expected delivery date' });
            return;
        }

        // Validate numeric fields
        if (isNaN(weight) || weight <= 0) {
            res.status(400).json({ error: 'Weight must be a positive number' });
            return;
        }

        if (isNaN(value) || value <= 0) {
            res.status(400).json({ error: 'Value must be a positive number' });
            return;
        }

        // Create shipment
        const shipmentData: CreateShipmentData = {
            exporter_name,
            exporter_address,
            exporter_contact,
            exporter_email,
            vendor_name,
            vendor_address,
            vendor_contact,
            vendor_email,
            receiver_name,
            receiver_address,
            receiver_contact,
            receiver_email,
            item_description,
            weight: parseFloat(weight),
            weight_unit: weight_unit || 'kg',
            dimensions_length: dimensions_length ? parseFloat(dimensions_length) : undefined,
            dimensions_width: dimensions_width ? parseFloat(dimensions_width) : undefined,
            dimensions_height: dimensions_height ? parseFloat(dimensions_height) : undefined,
            dimensions_unit: dimensions_unit || 'cm',
            value: parseFloat(value),
            currency: currency || 'USD',
            pickup_date,
            expected_delivery_date,
            mode_of_transport,
            created_by: (req.user!.userId || req.user!.id)!
        };

        const shipment = await ShipmentModel.create(shipmentData);

        // Audit log
        await createAuditLog({
            userId: req.user!.id,
            action: 'CREATE',
            entityType: 'shipment',
            entityId: shipment.id,
            details: { shipment_id: shipment.shipment_id },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        // Send email notification to accounts managers
        try {
            const accountsManagers = await UserModel.findByRole('accounts');
            const managerEmails = accountsManagers
                .filter((user: any) => user.is_active && user.email) // Using 'any' as 'User' type is not defined in this snippet
                .map((user: any) => user.email!); // Using 'any' as 'User' type is not defined in this snippet

            if (managerEmails.length > 0) {
                await emailService.sendNewShipmentNotification(shipment, managerEmails);
            }
        } catch (emailError) {
            console.error('Failed to send new shipment notification:', emailError);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            message: 'Shipment created successfully',
            shipment
        });
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ error: 'Failed to create shipment' });
    }
};

// Get Shipment by ID
export const getShipmentById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const shipment = await ShipmentModel.findById(id);

        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }

        // Get documents
        const documents = await DocumentModel.findByShipmentId(id);

        res.json({
            shipment,
            documents
        });
    } catch (error) {
        console.error('Error fetching shipment:', error);
        res.status(500).json({ error: 'Failed to fetch shipment' });
    }
};

// Update Shipment
export const updateShipment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const shipment = await ShipmentModel.findById(id);

        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }

        // Only creator or admin can update
        const userId = req.user!.id || req.user!.userId;
        if (shipment.created_by !== userId && req.user!.role !== 'admin') {
            res.status(403).json({ error: 'You do not have permission to update this shipment' });
            return;
        }

        // Cannot update approved or delivered shipments
        if (['approved', 'in_transit', 'delivered'].includes(shipment.status)) {
            res.status(400).json({ error: `Cannot update ${shipment.status} shipment` });
            return;
        }

        const updateData: UpdateShipmentData = {
            ...req.body,
            last_updated_by: req.user!.id
        };

        // Validate dates if provided
        if (updateData.pickup_date && updateData.expected_delivery_date) {
            const pickup = new Date(updateData.pickup_date);
            const delivery = new Date(updateData.expected_delivery_date);
            if (pickup > delivery) {
                res.status(400).json({ error: 'Pickup date must be before expected delivery date' });
                return;
            }
        }

        const updated = await ShipmentModel.update(id, updateData);

        // Audit log
        await createAuditLog({
            userId: req.user!.id,
            action: 'UPDATE',
            entityType: 'shipment',
            entityId: id,
            details: { changes: updateData },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            message: 'Shipment updated successfully',
            shipment: updated
        });
    } catch (error) {
        console.error('Error updating shipment:', error);
        res.status(500).json({ error: 'Failed to update shipment' });
    }
};

// Delete Shipment (Admin only)
export const deleteShipment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (req.user!.role !== 'admin') {
            res.status(403).json({ error: 'Only admins can delete shipments' });
            return;
        }

        const shipment = await ShipmentModel.findById(id);
        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }

        // Delete associated documents
        const documents = await DocumentModel.findByShipmentId(id);
        for (const doc of documents) {
            await deleteUploadedFile(doc.file_path);
            await DocumentModel.delete(doc.id);
        }

        // Delete shipment
        await ShipmentModel.delete(id);

        // Audit log
        await createAuditLog({
            userId: req.user!.id,
            action: 'DELETE',
            entityType: 'shipment',
            entityId: id,
            details: { shipment_id: shipment.shipment_id },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({ message: 'Shipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting shipment:', error);
        res.status(500).json({ error: 'Failed to delete shipment' });
    }
};

// List Shipments
export const listShipments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status, mode, search, limit = '10', offset = '0' } = req.query;
        let createdBy = undefined;

        // ClearanceManager and Accounts can only see their own shipments (except Admin)
        if (req.user!.role === 'clearance_manager') {
            createdBy = req.user!.id || req.user!.userId;
        }

        const filters = {
            status: status as string | undefined,
            mode: mode as string | undefined,
            search: search as string | undefined,
            createdBy,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string)
        };

        const { shipments, total } = await ShipmentModel.findAll(filters);

        res.json({
            shipments,
            pagination: {
                total,
                limit: filters.limit,
                offset: filters.offset,
                pages: Math.ceil(total / filters.limit)
            }
        });
    } catch (error) {
        console.error('Error listing shipments:', error);
        res.status(500).json({ error: 'Failed to fetch shipments' });
    }
};

// Get Statistics
export const getStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        let userId = undefined;
        const { dateFrom, dateTo } = req.query;

        // ClearanceAgent gets only their statistics
        if (req.user!.role === 'clearance_agent') {
            userId = req.user!.id || req.user!.userId;
        }

        const stats = await ShipmentModel.getStatistics(
            userId,
            dateFrom ? String(dateFrom) : undefined,
            dateTo ? String(dateTo) : undefined
        );
        const recentShipments = await ShipmentModel.getRecentShipments(
            5,
            userId,
            dateFrom ? String(dateFrom) : undefined,
            dateTo ? String(dateTo) : undefined
        );

        res.json({
            statistics: stats,
            recentShipments
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// Approve Shipment (Accounts Manager only)
export const approveShipment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (req.user!.role !== 'accounts') {
            res.status(403).json({ error: 'Only accounts managers can approve shipments' });
            return;
        }

        const shipment = await ShipmentModel.findById(id);
        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }

        if (shipment.status !== 'created' && shipment.status !== 'changes_requested') {
            res.status(400).json({ error: `Cannot approve shipment with status: ${shipment.status}` });
            return;
        }

        // Validate required documents are present
        const validation = await validateShipmentDocuments(id, shipment.mode_of_transport);
        if (!validation.isValid) {
            res.status(400).json({
                error: 'Cannot approve shipment: missing required documents',
                details: validation.errors,
                missingDocuments: validation.missingDocuments
            });
            return;
        }

        const updated = await ShipmentModel.update(id, {
            status: 'approved',
            last_updated_by: req.user!.id
        });

        // Audit log
        await createAuditLog({
            userId: req.user!.id,
            action: 'APPROVE',
            entityType: 'shipment',
            entityId: id,
            details: { shipment_id: shipment.shipment_id },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        // Send email notification to shipment creator
        try {
            const creator = await UserModel.findById(shipment.created_by!);
            if (creator && creator.email) {
                await emailService.sendApprovalNotification(updated, creator.email);
            }
        } catch (emailError) {
            console.error('Failed to send approval notification:', emailError);
        }

        res.json({
            message: 'Shipment approved successfully',
            shipment: updated
        });
    } catch (error) {
        console.error('Error approving shipment:', error);
        res.status(500).json({ error: 'Failed to approve shipment' });
    }
};

// Reject Shipment (Accounts Manager only)
export const rejectShipment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (req.user!.role !== 'accounts') {
            res.status(403).json({ error: 'Only accounts managers can reject shipments' });
            return;
        }

        if (!reason) {
            res.status(400).json({ error: 'Rejection reason is required' });
            return;
        }

        const shipment = await ShipmentModel.findById(id);
        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }

        if (shipment.status !== 'created' && shipment.status !== 'changes_requested') {
            res.status(400).json({ error: `Cannot reject shipment with status: ${shipment.status}` });
            return;
        }

        const updated = await ShipmentModel.update(id, {
            status: 'rejected',
            rejection_reason: reason,
            last_updated_by: req.user!.id
        });

        // Audit log
        await createAuditLog({
            userId: req.user!.id,
            action: 'REJECT',
            entityType: 'shipment',
            entityId: id,
            details: { shipment_id: shipment.shipment_id, reason },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        // Send email notification to shipment creator
        try {
            const creator = await UserModel.findById(shipment.created_by!);
            if (creator && creator.email) {
                await emailService.sendRejectionNotification(updated, creator.email, reason);
            }
        } catch (emailError) {
            console.error('Failed to send rejection notification:', emailError);
        }

        res.json({
            message: 'Shipment rejected successfully',
            shipment: updated
        });
    } catch (error) {
        console.error('Error rejecting shipment:', error);
        res.status(500).json({ error: 'Failed to reject shipment' });
    }
};

// Request Changes (Accounts Manager only)
export const requestChanges = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (req.user!.role !== 'accounts') {
            res.status(403).json({ error: 'Only accounts managers can request changes' });
            return;
        }

        const shipment = await ShipmentModel.findById(id);
        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }

        if (shipment.status !== 'created' && shipment.status !== 'changes_requested') {
            res.status(400).json({ error: `Cannot request changes for shipment with status: ${shipment.status}` });
            return;
        }

        const updated = await ShipmentModel.update(id, {
            status: 'changes_requested',
            rejection_reason: message || null,
            last_updated_by: req.user!.id
        });

        // Audit log
        await createAuditLog({
            userId: req.user!.id,
            action: 'REQUEST_CHANGES',
            entityType: 'shipment',
            entityId: id,
            details: { shipment_id: shipment.shipment_id, message },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        // Send email notification to shipment creator
        try {
            const creator = await UserModel.findById(shipment.created_by!);
            if (creator && creator.email) {
                await emailService.sendChangesRequestedNotification(updated, creator.email, message || 'Please review and update your shipment.');
            }
        } catch (emailError) {
            console.error('Failed to send changes requested notification:', emailError);
        }

        res.json({
            message: 'Change request sent successfully',
            shipment: updated
        });
    } catch (error) {
        console.error('Error requesting changes:', error);
        res.status(500).json({ error: 'Failed to request changes' });
    }
};
