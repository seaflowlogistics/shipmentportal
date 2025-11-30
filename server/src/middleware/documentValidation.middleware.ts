import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate document upload
 * Checks file type, size, and document type requirements
 */
export function validateDocumentUpload(req: Request, res: Response, next: NextFunction): void {
    const { document_type } = req.body;
    const file = req.file;

    // Check if file exists
    if (!file) {
        res.status(400).json({ error: 'No file provided' });
        return;
    }

    // Check if document type is provided
    if (!document_type) {
        res.status(400).json({ error: 'Document type is required' });
        return;
    }

    // Validate document type
    const validTypes = ['invoice', 'packing_list', 'bill_of_lading', 'air_waybill', 'other'];
    if (!validTypes.includes(document_type)) {
        res.status(400).json({
            error: 'Invalid document type',
            validTypes: validTypes
        });
        return;
    }

    // File type and size validation is already handled by multer middleware
    // (see upload.middleware.ts)

    next();
}

/**
 * Error handler for multer file upload errors
 */
export function handleUploadError(err: any, _req: Request, res: Response, next: NextFunction): void {
    if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
                error: 'File too large',
                details: 'Maximum file size is 10MB'
            });
            return;
        }

        if (err.message && err.message.includes('Invalid file type')) {
            res.status(400).json({
                error: 'Invalid file type',
                details: 'Only PDF and JPEG files are allowed'
            });
            return;
        }

        res.status(400).json({
            error: 'File upload failed',
            details: err.message
        });
        return;
    }

    next();
}
