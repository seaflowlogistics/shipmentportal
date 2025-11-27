import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface RefreshToken {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
    created_at: Date;
}

export class RefreshTokenModel {
    static async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
        const result = await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [userId, token, expiresAt]
        );
        return result.rows[0];
    }

    static async findByToken(token: string): Promise<RefreshToken | null> {
        const result = await pool.query(
            'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
            [token]
        );
        return result.rows[0] || null;
    }

    static async deleteByToken(token: string): Promise<void> {
        await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    }

    static async deleteByUserId(userId: string): Promise<void> {
        await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    }

    static async deleteExpired(): Promise<void> {
        await pool.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
    }
}

export interface PasswordResetToken {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
    used: boolean;
    created_at: Date;
}

export class PasswordResetTokenModel {
    static async create(userId: string, expiresAt: Date): Promise<PasswordResetToken> {
        const token = uuidv4();
        const result = await pool.query(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [userId, token, expiresAt]
        );
        return result.rows[0];
    }

    static async findByToken(token: string): Promise<PasswordResetToken | null> {
        const result = await pool.query(
            'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW() AND used = false',
            [token]
        );
        return result.rows[0] || null;
    }

    static async markAsUsed(token: string): Promise<void> {
        await pool.query(
            'UPDATE password_reset_tokens SET used = true WHERE token = $1',
            [token]
        );
    }

    static async deleteByUserId(userId: string): Promise<void> {
        await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
    }

    static async deleteExpired(): Promise<void> {
        await pool.query('DELETE FROM password_reset_tokens WHERE expires_at < NOW()');
    }
}
