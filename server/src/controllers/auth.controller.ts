import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserModel } from '../models/User';
import { RefreshTokenModel, PasswordResetTokenModel } from '../models/Token';
import { comparePassword, hashPassword, validatePasswordStrength } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { emailService } from '../services/email.service';
import { createAuditLog } from '../utils/auditLog';
import { authConfig } from '../config/auth';

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { username, password, rememberMe } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }

        // Find user
        const user = await UserModel.findByUsername(username);
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Check if account is active
        if (!user.is_active) {
            res.status(403).json({ error: 'Account is inactive' });
            return;
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            await createAuditLog({
                userId: user.id,
                action: 'LOGIN_FAILED',
                details: { reason: 'Invalid password' },
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });

            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Update last login
        await UserModel.updateLastLogin(user.id);

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Store refresh token
        const expiresAt = new Date(
            Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000
        );
        await RefreshTokenModel.create(user.id, refreshToken, expiresAt);

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: 'LOGIN_SUCCESS',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.full_name,
                isActive: user.is_active,
                mustChangePassword: user.must_change_password,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await RefreshTokenModel.deleteByToken(refreshToken);
        }

        if (req.user) {
            await createAuditLog({
                userId: req.user.userId,
                action: 'LOGOUT',
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
};

export const refreshAccessToken = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token is required' });
            return;
        }

        // Verify refresh token
        const payload = verifyRefreshToken(refreshToken);

        // Check if token exists in database
        const storedToken = await RefreshTokenModel.findByToken(refreshToken);
        if (!storedToken) {
            res.status(401).json({ error: 'Invalid refresh token' });
            return;
        }

        // Get user
        const userId = payload.userId || payload.id;
        if (!userId) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        const user = await UserModel.findById(userId);
        if (!user || !user.is_active) {
            res.status(401).json({ error: 'User not found or inactive' });
            return;
        }

        // Generate new tokens
        const newTokenPayload = {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        const newAccessToken = generateAccessToken(newTokenPayload);
        const newRefreshToken = generateRefreshToken(newTokenPayload);

        // Delete old refresh token and store new one
        await RefreshTokenModel.deleteByToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await RefreshTokenModel.create(user.id, newRefreshToken, expiresAt);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }

        const user = await UserModel.findByEmail(email);

        // Always return success to prevent email enumeration
        if (!user) {
            res.json({ message: 'If the email exists, a password reset link has been sent' });
            return;
        }

        // Delete any existing reset tokens for this user
        await PasswordResetTokenModel.deleteByUserId(user.id);

        // Create new reset token (expires in 1 hour)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        const resetToken = await PasswordResetTokenModel.create(user.id, expiresAt);

        // Send password reset email
        try {
            await emailService.sendPasswordResetEmail(
                user.email,
                resetToken.token,
                user.full_name || user.username
            );
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            // Don't reveal email sending failure to prevent enumeration
        }

        await createAuditLog({
            userId: user.id,
            action: 'PASSWORD_RESET_REQUESTED',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            message: 'If the email exists, a password reset link has been sent'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            res.status(400).json({ error: 'Token and new password are required' });
            return;
        }

        // Validate password strength
        const validation = validatePasswordStrength(newPassword);
        if (!validation.isValid) {
            res.status(400).json({ error: 'Weak password', details: validation.errors });
            return;
        }

        // Find reset token
        const resetToken = await PasswordResetTokenModel.findByToken(token);
        if (!resetToken) {
            res.status(400).json({ error: 'Invalid or expired reset token' });
            return;
        }

        // Hash new password
        const passwordHash = await hashPassword(newPassword);

        // Update password
        await UserModel.updatePassword(resetToken.user_id, passwordHash);

        // Mark token as used
        await PasswordResetTokenModel.markAsUsed(token);

        // Delete all refresh tokens for this user (force re-login)
        await RefreshTokenModel.deleteByUserId(resetToken.user_id);

        await createAuditLog({
            userId: resetToken.user_id,
            action: 'PASSWORD_RESET_COMPLETED',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { currentPassword, newPassword } = req.body;

        if (!newPassword) {
            res.status(400).json({ error: 'New password is required' });
            return;
        }

        // Validate password strength
        const validation = validatePasswordStrength(newPassword);
        if (!validation.isValid) {
            res.status(400).json({ error: 'Weak password', details: validation.errors });
            return;
        }

        // Get user
        const userId = req.user.userId || req.user.id;
        if (!userId) {
            res.status(401).json({ error: 'Invalid authentication' });
            return;
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // If user is not forced to change password, verify current password
        if (!user.must_change_password && !currentPassword) {
            res.status(400).json({ error: 'Current password is required' });
            return;
        }

        if (!user.must_change_password) {
            // Verify current password for normal password change
            const isValidPassword = await comparePassword(currentPassword, user.password_hash);
            if (!isValidPassword) {
                res.status(401).json({ error: 'Current password is incorrect' });
                return;
            }
        }

        // Hash new password
        const passwordHash = await hashPassword(newPassword);

        // Update password and clear must_change_password flag
        await UserModel.updatePassword(user.id, passwordHash);
        if (user.must_change_password) {
            await UserModel.update(user.id, { must_change_password: false });
        }

        await createAuditLog({
            userId: user.id,
            action: 'PASSWORD_CHANGED',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const userId = req.user.userId || req.user.id;
        if (!userId) {
            res.status(401).json({ error: 'Invalid authentication' });
            return;
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.full_name,
                isActive: user.is_active,
                mustChangePassword: user.must_change_password,
                lastLogin: user.last_login,
            },
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Failed to get user information' });
    }
};
