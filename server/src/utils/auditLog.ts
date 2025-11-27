import pool from '../config/database';

export interface AuditLogEntry {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

export const createAuditLog = async (entry: AuditLogEntry): Promise<void> => {
    try {
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                entry.userId || null,
                entry.action,
                entry.entityType || null,
                entry.entityId || null,
                entry.details ? JSON.stringify(entry.details) : null,
                entry.ipAddress || null,
                entry.userAgent || null,
            ]
        );
    } catch (error) {
        console.error('Error creating audit log:', error);
        // Don't throw error - audit logging should not break the main flow
    }
};
