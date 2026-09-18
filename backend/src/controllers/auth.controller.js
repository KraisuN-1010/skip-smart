import bcrypt from 'bcrypt';
import { query } from '../db/index.js';
import { sendVerificationEmail } from '../services/email.service.js';
import {
    generateVerificationCode,
    hashToken,
    signAccessToken,
    generateRefreshToken,
    getRefreshTokenExpiry,
    getVerificationCodeExpiry,
} from '../utils/tokens.js';

const SALT_ROUNDS = 12;

export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, thresholdPct, startDate, endDate } = req.body;
        
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const verificationCode = generateVerificationCode();
        const verificationCodeHash = hashToken(verificationCode);
        const verificationCodeExpiresAt = getVerificationCodeExpiry();
        let userId;

        try {
            const { rows } = await query(
                `INSERT INTO users (
                    email, password_hash, first_name, last_name, threshold_pct,
                    semester_start, semester_end,
                    verification_code_hash, verification_code_expires_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id`,
                [
                    email,
                    passwordHash,
                    firstName,
                    lastName,
                    thresholdPct,
                    startDate,
                    endDate,
                    verificationCodeHash,
                    verificationCodeExpiresAt,
                ]
            );
            userId = rows[0].id;
        } catch (err) {
            if (err.code === '23505') {
                return res.status(409).json({ error: 'Email already registered' });
            }
            throw err;
        }

        await sendVerificationEmail(email, firstName, verificationCode);

        return res.status(201).json({
            message: 'Account created. Please check your email for a verification code.',
            userId,
        });
    } catch (err) {
        console.error('Signup error:', err.message);
        return res.status(500).json({ error: 'Something went wrong during signup' });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const codeHash = hashToken(code);

        const { rows } = await query(
            `SELECT id, verification_code_hash, verification_code_expires_at, is_verified 
             FROM users WHERE email = $1`,
            [email]
        );
        
        const user = rows[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ error: 'Account already verified' });
        }

        if (!user.verification_code_hash || new Date(user.verification_code_expires_at) < new Date()) {
            return res.status(400).json({ error: 'Verification code expired. Please request a new one.' });
        }

        if (user.verification_code_hash !== codeHash) {
            return res.status(400).json({ error: 'Incorrect verification code' });
        }

        await query(
            `UPDATE users 
             SET is_verified = true, verification_code_hash = NULL, verification_code_expires_at = NULL 
             WHERE id = $1`,
            [user.id]
        );

        return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        console.error('Verify email error:', err.message);
        return res.status(500).json({ error: 'Something went wrong during verification' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { rows } = await query(
            `SELECT id, password_hash, is_verified FROM users WHERE email = $1`,
            [email]
        );
        
        const user = rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.is_verified) {
            return res.status(403).json({ error: 'Please verify your email before logging in' });
        }

        const accessToken = signAccessToken(user.id);
        const refreshToken = generateRefreshToken();
        const refreshTokenHash = hashToken(refreshToken);
        const refreshTokenExpiresAt = getRefreshTokenExpiry();

        await query(
            `INSERT INTO refresh_tokens (user_id, token_hash, device_info, expires_at) 
             VALUES ($1, $2, $3, $4)`,
            [user.id, refreshTokenHash, req.headers['user-agent'] || null, refreshTokenExpiresAt]
        );

        return res.status(200).json({ accessToken, refreshToken });
    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ error: 'Something went wrong during login' });
    }
};

export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const tokenHash = hashToken(refreshToken);

        const { rows } = await query(
            `SELECT id, user_id, revoked_at, expires_at FROM refresh_tokens WHERE token_hash = $1`,
            [tokenHash]
        );
        
        const tokenRow = rows[0];
        if (!tokenRow || tokenRow.revoked_at || new Date(tokenRow.expires_at) < new Date()) {
            return res.status(401).json({ error: 'Invalid or expired refresh token. Please log in again.' });
        }

        const accessToken = signAccessToken(tokenRow.user_id);
        return res.status(200).json({ accessToken });
    } catch (err) {
        console.error('Refresh error:', err.message);
        return res.status(500).json({ error: 'Something went wrong during token refresh' });
    }
};

export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const tokenHash = hashToken(refreshToken);

        await query(
            `UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL`,
            [tokenHash]
        );

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err.message);
        return res.status(500).json({ error: 'Something went wrong during logout' });
    }
};

export const logoutAll = async (req, res) => {
    try {
        const userId = req.user.id;
        
        await query(
            `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
            [userId]
        );

        return res.status(200).json({ message: 'Logged out from all devices' });
    } catch (err) {
        console.error('Logout-all error:', err.message);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};