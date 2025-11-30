import pool from '../config/database';

export interface Document {
    id: string;
    shipment_id: string;
    document_type: 'invoice' | 'packing_list' | 'bill_of_lading' | 'air_waybill' | 'other';
    file_name: string;
    file_path: string;
    file_size: number;
    file_type?: string;
    uploaded_by?: string;
    uploaded_at: Date;
}

export interface CreateDocumentData {
    shipment_id: string;
    document_type: 'invoice' | 'packing_list' | 'bill_of_lading' | 'air_waybill' | 'other';
    file_name: string;
    file_path: string;
    file_size: number;
    file_type?: string;
    uploaded_by: string;
}

export class DocumentModel {
    static async findById(id: string): Promise<Document | null> {
        const result = await pool.query(
            'SELECT * FROM documents WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    static async findByShipmentId(shipmentId: string): Promise<Document[]> {
        const result = await pool.query(
            'SELECT * FROM documents WHERE shipment_id = $1 ORDER BY uploaded_at DESC',
            [shipmentId]
        );
        return result.rows;
    }

    static async create(data: CreateDocumentData): Promise<Document> {
        const result = await pool.query(
            `INSERT INTO documents (
                shipment_id, document_type, file_name, file_path, file_size, file_type, uploaded_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                data.shipment_id,
                data.document_type,
                data.file_name,
                data.file_path,
                data.file_size,
                data.file_type || null,
                data.uploaded_by
            ]
        );
        return result.rows[0];
    }

    static async delete(id: string): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM documents WHERE id = $1',
            [id]
        );
        return result.rowCount !== null && result.rowCount > 0;
    }

    static async deleteByShipmentId(shipmentId: string): Promise<number> {
        const result = await pool.query(
            'DELETE FROM documents WHERE shipment_id = $1',
            [shipmentId]
        );
        return result.rowCount || 0;
    }

    static async findByDocumentType(shipmentId: string, documentType: string): Promise<Document | null> {
        const result = await pool.query(
            'SELECT * FROM documents WHERE shipment_id = $1 AND document_type = $2',
            [shipmentId, documentType]
        );
        return result.rows[0] || null;
    }
}
