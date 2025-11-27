import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export type UserRole = 'admin' | 'accounts' | 'clearance_manager';

export const requireRole = (...allowedRoles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!allowedRoles.includes(req.user.role as UserRole)) {
            res.status(403).json({
                error: 'Access denied',
                message: 'You do not have permission to access this resource'
            });
            return;
        }

        next();
    };
};

// Specific role middleware
export const requireAdmin = requireRole('admin');
export const requireAccounts = requireRole('admin', 'accounts');
export const requireClearanceManager = requireRole('admin', 'clearance_manager');
