import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserModel } from '../models/User';
import { hashPassword, generateRandomPassword } from '../utils/password';
import { sendWelcomeEmail } from '../utils/email';
import { createAuditLog } from '../utils/auditLog';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page = '1', limit = '10', role, search } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const offset = (pageNum - 1) * limitNum;

        const { users, total } = await UserModel.findAll({
            role: role as string,
            search: search as string,
            limit: limitNum,
            offset,
        });

        // Remove password hashes from response
        const sanitizedUsers = users.map((user) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.full_name,
            isActive: user.is_active,
            lastLogin: user.last_login,
            createdAt: user.created_at,
        }));

        res.json({
            users: sanitizedUsers,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { username, email, password, role, fullName } = req.body;

        if (!username || !email || !role) {
            res.status(400).json({ error: 'Username, email, and role are required' });
            return;
        }

        // Validate role
        const validRoles = ['admin', 'accounts', 'clearance_manager'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ error: 'Invalid role' });
            return;
        }

        // Check if username or email already exists
        const existingUser = await UserModel.findByUsername(username);
        if (existingUser) {
            res.status(409).json({ error: 'Username already exists' });
            return;
        }

        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail) {
            res.status(409).json({ error: 'Email already exists' });
            return;
        }

        // Generate password if not provided
        const userPassword = password || generateRandomPassword();
        const passwordHash = await hashPassword(userPassword);

        // Create user
        const newUser = await UserModel.create({
            username,
            email,
            password_hash: passwordHash,
            role,
            full_name: fullName,
            created_by: req.user.userId,
        });

        // Send welcome email
        try {
            await sendWelcomeEmail(email, username, userPassword);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the request if email fails
        }

        await createAuditLog({
            userId: req.user.userId,
            action: 'USER_CREATED',
            entityType: 'user',
            entityId: newUser.id,
            details: { username, email, role },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                fullName: newUser.full_name,
                isActive: newUser.is_active,
            },
            temporaryPassword: userPassword,
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { id } = req.params;
        const { email, role, fullName, isActive } = req.body;

        // Check if user exists
        const existingUser = await UserModel.findById(id);
        if (!existingUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Validate role if provided
        if (role) {
            const validRoles = ['admin', 'accounts', 'clearance_manager'];
            if (!validRoles.includes(role)) {
                res.status(400).json({ error: 'Invalid role' });
                return;
            }
        }

        // Check if email is already taken by another user
        if (email && email !== existingUser.email) {
            const emailExists = await UserModel.findByEmail(email);
            if (emailExists) {
                res.status(409).json({ error: 'Email already exists' });
                return;
            }
        }

        // Update user
        const updatedUser = await UserModel.update(id, {
            email,
            role,
            full_name: fullName,
            is_active: isActive,
        });

        if (!updatedUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        await createAuditLog({
            userId: req.user.userId,
            action: 'USER_UPDATED',
            entityType: 'user',
            entityId: id,
            details: { email, role, fullName, isActive },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            message: 'User updated successfully',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                fullName: updatedUser.full_name,
                isActive: updatedUser.is_active,
            },
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { id } = req.params;

        // Prevent self-deletion
        if (id === req.user.userId) {
            res.status(400).json({ error: 'Cannot delete your own account' });
            return;
        }

        // Check if user exists
        const existingUser = await UserModel.findById(id);
        if (!existingUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Before deleting, we need to handle foreign key constraints
        // by nullifying references in other tables
        await UserModel.nullifyUserReferences(id);

        // Delete user
        const deleted = await UserModel.delete(id);
        if (!deleted) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        await createAuditLog({
            userId: req.user.userId,
            action: 'USER_DELETED',
            entityType: 'user',
            entityId: id,
            details: { username: existingUser.username, email: existingUser.email },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { id } = req.params;

        // Check if user exists
        const user = await UserModel.findById(id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Generate new password
        const newPassword = generateRandomPassword();
        const passwordHash = await hashPassword(newPassword);

        // Update password
        await UserModel.updatePassword(id, passwordHash);

        // Send email with new password
        try {
            await sendWelcomeEmail(user.email, user.username, newPassword);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
        }

        await createAuditLog({
            userId: req.user.userId,
            action: 'USER_PASSWORD_RESET',
            entityType: 'user',
            entityId: id,
            details: { username: user.username },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            message: 'Password reset successfully. Email sent to user.',
            temporaryPassword: newPassword,
        });
    } catch (error) {
        console.error('Reset user password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};
