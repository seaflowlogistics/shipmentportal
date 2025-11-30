import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DocumentModel } from '../models/Document';
import { ShipmentModel } from '../models/Shipment';
import { createAuditLog } from '../utils/auditLog';
import { deleteUploadedFile } from '../middleware/upload.middleware';

// Upload Document
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { shipment_id } = req.params;
        const { document_type } = req.body;
        const file = req.file;

        if (!file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }

        if (!document_type) {
            // Clean up uploaded file
            deleteUploadedFile(file.path);
            res.status(400).json({ error: 'Document type is required' });
            return;
        }

        // Verify shipment exists
        const shipment = await ShipmentModel.findById(shipment_id);
        if (!shipment) {
            // Clean up uploaded file
            deleteUploadedFile(file.path);
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }

        // Only creator or admin can upload documents
        const userId = req.user!.id || req.user!.userId;
        if (shipment.created_by !== userId && req.user!.role !== 'admin') {
            // Clean up uploaded file
            deleteUploadedFile(file.path);
            res.status(403).json({ error: 'You do not have permission to upload documents for this shipment' });
            return;
        }

        // Create document record
        const document = await DocumentModel.create({
            shipment_id,
            document_type: document_type as any,
            file_name: file.originalname,
            file_path: file.path,
            file_size: file.size,
            file_type: file.mimetype,
            uploaded_by: (req.user!.id || req.user!.userId)!
        });

        // Audit log
        await createAuditLog({
            userId: req.user!.id,
            action: 'UPLOAD_DOCUMENT',
            entityType: 'document',
            entityId: document.id,
            details: {
                document_type,
                file_name: file.originalname,
                shipment_id
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            message: 'Document uploaded successfully',
            document
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file) {
            deleteUploadedFile(req.file.path);
        }
        console.error('Error uploading document:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
};

// Get Documents for Shipment
export const getShipmentDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { shipment_id } = req.params;

        // Verify shipment exists
        const shipment = await ShipmentModel.findById(shipment_id);
        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }

        const documents = await DocumentModel.findByShipmentId(shipment_id);

        res.json({
            shipment_id,
            documents,
            count: documents.length
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

// Delete Document
export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { document_id } = req.params;

        const document = await DocumentModel.findById(document_id);
        if (!document) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }

        const shipment = await ShipmentModel.findById(document.shipment_id);
        if (!shipment) {
            res.status(404).json({ error: 'Associated shipment not found' });
            return;
        }

        // Only creator, shipment creator or admin can delete
        const userId = req.user!.id || req.user!.userId;
        if (
            document.uploaded_by !== userId &&
            shipment.created_by !== userId &&
            req.user!.role !== 'admin'
        ) {
            res.status(403).json({ error: 'You do not have permission to delete this document' });
            return;
        }

        // Delete file
        deleteUploadedFile(document.file_path);

        // Delete document record
        await DocumentModel.delete(document_id);

        // Audit log
        await createAuditLog({
            userId: req.user!.id,
            action: 'DELETE_DOCUMENT',
            entityType: 'document',
            entityId: document_id,
            details: {
                document_type: document.document_type,
                file_name: document.file_name,
                shipment_id: document.shipment_id
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
};

// Download Document
export const downloadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { document_id } = req.params;

        const document = await DocumentModel.findById(document_id);
        if (!document) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }

        // Audit log for download
        await createAuditLog({
            userId: req.user!.id,
            action: 'DOWNLOAD_DOCUMENT',
            entityType: 'document',
            entityId: document_id,
            details: {
                file_name: document.file_name,
                shipment_id: document.shipment_id
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.download(document.file_path, document.file_name);
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ error: 'Failed to download document' });
    }
};
