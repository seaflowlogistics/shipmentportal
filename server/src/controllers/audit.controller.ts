import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import pool from '../config/database';

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Only admin can view audit logs
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const { action, entityType, startDate, endDate, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (action) {
            query += ` AND action = $${paramIndex}`;
            params.push(action);
            paramIndex++;
        }

        if (entityType) {
            query += ` AND entity_type = $${paramIndex}`;
            params.push(entityType);
            paramIndex++;
        }

        if (startDate) {
            query += ` AND created_at >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            query += ` AND created_at <= $${paramIndex}`;
            params.push(endDate);
            paramIndex++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            logs: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ error: 'Failed to get audit logs' });
    }
};
