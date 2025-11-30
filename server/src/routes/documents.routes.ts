import { Router } from 'express';
import {
    uploadDocument,
    getShipmentDocuments,
    deleteDocument,
    downloadDocument
} from '../controllers/documents.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// All document routes require authentication
router.use(authenticate);

// Upload document (multipart form-data)
router.post('/:shipment_id/upload', upload.single('file'), uploadDocument);

// Get documents for shipment
router.get('/:shipment_id', getShipmentDocuments);

// Download document
router.get('/:document_id/download', downloadDocument);

// Delete document
router.delete('/:document_id', deleteDocument);

export default router;
