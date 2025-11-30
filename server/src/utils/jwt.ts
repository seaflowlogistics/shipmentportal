import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { authConfig } from '../config/auth';

export interface TokenPayload {
    userId?: string;
    id?: string;
    username: string;
    email: string;
    role: string;
    jti?: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    const tokenPayload: any = { ...payload, jti: uuidv4() };
    return jwt.sign(
        tokenPayload,
        authConfig.jwtSecret as any,
        { expiresIn: authConfig.jwtExpiresIn } as any
    );
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    const tokenPayload: any = { ...payload, jti: uuidv4() };
    return jwt.sign(
        tokenPayload,
        authConfig.jwtRefreshSecret as any,
        { expiresIn: authConfig.jwtRefreshExpiresIn } as any
    );
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
