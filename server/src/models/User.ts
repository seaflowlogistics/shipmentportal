import pool from '../config/database';

export interface User {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    role: 'admin' | 'accounts' | 'clearance_manager';
    full_name?: string;
    is_active: boolean;
    must_change_password: boolean;
    failed_login_attempts: number;
    locked_until?: Date;
    last_login?: Date;
    created_by?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserData {
    username: string;
    email: string;
    password_hash: string;
    role: string;
    full_name?: string;
    created_by?: string;
}

export interface UpdateUserData {
    email?: string;
    role?: string;
    full_name?: string;
    is_active?: boolean;
}

export class UserModel {
    static async findById(id: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    static async findByUsername(username: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        return result.rows[0] || null;
    }

    static async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0] || null;
    }

    static async create(data: CreateUserData): Promise<User> {
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, role, full_name, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [data.username, data.email, data.password_hash, data.role, data.full_name, data.created_by]
        );
        return result.rows[0];
    }

    static async update(id: string, data: UpdateUserData): Promise<User | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.email !== undefined) {
            fields.push(`email = $${paramCount++}`);
            values.push(data.email);
        }
        if (data.role !== undefined) {
            fields.push(`role = $${paramCount++}`);
            values.push(data.role);
        }
        if (data.full_name !== undefined) {
            fields.push(`full_name = $${paramCount++}`);
            values.push(data.full_name);
        }
        if (data.is_active !== undefined) {
            fields.push(`is_active = $${paramCount++}`);
            values.push(data.is_active);
        }

        // Always update updated_at timestamp (application-level for CockroachDB/PostgreSQL compatibility)
        fields.push(`updated_at = $${paramCount++}`);
        values.push(new Date());

        if (fields.length === 1) {
            // Only updated_at was set, nothing else to update
            return this.findById(id);
        }

        values.push(id);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    static async nullifyUserReferences(id: string): Promise<void> {
        // Nullify references in other tables to avoid foreign key constraint errors
        await Promise.all([
            // Nullify created_by in users table (users created by this user)
            pool.query('UPDATE users SET created_by = NULL WHERE created_by = $1', [id]),
            // Nullify created_by and last_updated_by in shipments table
            pool.query('UPDATE shipments SET created_by = NULL WHERE created_by = $1', [id]),
            pool.query('UPDATE shipments SET last_updated_by = NULL WHERE last_updated_by = $1', [id]),
            // Nullify uploaded_by in documents table
            pool.query('UPDATE documents SET uploaded_by = NULL WHERE uploaded_by = $1', [id]),
            // Nullify user_id in audit_logs table
            pool.query('UPDATE audit_logs SET user_id = NULL WHERE user_id = $1', [id]),
            // Note: refresh_tokens and password_reset_tokens have ON DELETE CASCADE
            // so they will be automatically deleted
        ]);
    }

    static async delete(id: string): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1',
            [id]
        );
        return result.rowCount !== null && result.rowCount > 0;
    }

    static async findAll(filters?: {
        role?: string;
        isActive?: boolean;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ users: User[]; total: number }> {
        let query = 'SELECT * FROM users WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
        const values: any[] = [];
        let paramCount = 1;

        if (filters?.role) {
            query += ` AND role = $${paramCount}`;
            countQuery += ` AND role = $${paramCount}`;
            values.push(filters.role);
            paramCount++;
        }

        if (filters?.isActive !== undefined) {
            query += ` AND is_active = $${paramCount}`;
            countQuery += ` AND is_active = $${paramCount}`;
            values.push(filters.isActive);
            paramCount++;
        }

        if (filters?.search) {
            query += ` AND (username ILIKE $${paramCount} OR email ILIKE $${paramCount} OR full_name ILIKE $${paramCount})`;
            countQuery += ` AND (username ILIKE $${paramCount} OR email ILIKE $${paramCount} OR full_name ILIKE $${paramCount})`;
            values.push(`%${filters.search}%`);
            paramCount++;
        }

        query += ' ORDER BY created_at DESC';

        if (filters?.limit) {
            query += ` LIMIT $${paramCount}`;
            values.push(filters.limit);
            paramCount++;
        }

        if (filters?.offset) {
            query += ` OFFSET $${paramCount}`;
            values.push(filters.offset);
        }

        const [usersResult, countResult] = await Promise.all([
            pool.query(query, values),
            pool.query(countQuery, values.slice(0, paramCount - (filters?.limit ? 2 : 1))),
        ]);

        return {
            users: usersResult.rows,
            total: parseInt(countResult.rows[0].count),
        };
    }

    static async updatePassword(id: string, passwordHash: string): Promise<void> {
        await pool.query(
            'UPDATE users SET password_hash = $1, must_change_password = false WHERE id = $2',
            [passwordHash, id]
        );
    }

    static async incrementFailedAttempts(id: string): Promise<void> {
        await pool.query(
            'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1',
            [id]
        );
    }

    static async resetFailedAttempts(id: string): Promise<void> {
        await pool.query(
            'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1',
            [id]
        );
    }

    static async lockAccount(id: string, lockUntil: Date): Promise<void> {
        await pool.query(
            'UPDATE users SET locked_until = $1 WHERE id = $2',
            [lockUntil, id]
        );
    }

    static async updateLastLogin(id: string): Promise<void> {
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [id]
        );
    }
}
