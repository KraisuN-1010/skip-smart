import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

export const generateVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

export const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

export const signAccessToken = (userId) => {
    return jwt.sign({ userId }, ENV.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

export const getRefreshTokenExpiry = () => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return expiry;
};

export const getVerificationCodeExpiry = () => {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    return expiry;
};
