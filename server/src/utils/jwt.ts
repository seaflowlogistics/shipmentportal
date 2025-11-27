import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';

export interface TokenPayload {
    userId: string;
    username: string;
    email: string;
    role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, authConfig.jwtSecret, {
        expiresIn: authConfig.jwtExpiresIn,
    });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, authConfig.jwtRefreshSecret, {
        expiresIn: authConfig.jwtRefreshExpiresIn,
    });
};

export const verifyAccessToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, authConfig.jwtSecret) as TokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, authConfig.jwtRefreshSecret) as TokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

export const decodeToken = (token: string): TokenPayload | null => {
    try {
        return jwt.decode(token) as TokenPayload;
    } catch (error) {
        return null;
    }
};
