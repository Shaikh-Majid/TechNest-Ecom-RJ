const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// ==========================================
// REGISTER ENDPOINT
// ==========================================

router.post('/register', [
    body('username').trim().isLength({ min: 3, max: 50 }),
    body('email').trim().isEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
    body('firstName').optional().trim(),
    body('lastName').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { username, email, password, firstName, lastName } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        await executeQuery(
            `INSERT INTO users (username, email, password, first_name, last_name) 
             VALUES (:username, :email, :password, :firstName, :lastName)`,
            {
                username,
                email,
                password: hashedPassword,
                firstName: firstName || null,
                lastName: lastName || null
            },
            { autoCommit: true }
        );

        const token = jwt.sign(
            { email, username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        await executeQuery(
            `INSERT INTO activity_logs (user_id, action, ip_address) 
             VALUES ((SELECT user_id FROM users WHERE email = :email), 'REGISTER', :ip)`,
            { email, ip: req.ip },
            { autoCommit: true }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: { username, email, firstName, lastName }
        });

    } catch (err) {
        if (err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ success: false, message: 'Email/username exists' });
        }
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// ==========================================
// LOGIN ENDPOINT
// ==========================================

router.post('/login', [
    body('email').trim().isEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password, rememberMe } = req.body;

        const userResult = await executeQuery(
            `SELECT user_id, username, email, password, first_name, last_name, is_active 
             FROM users WHERE email = :email`,
            { email }
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = userResult.rows[0];

        if (!user[6]) { // is_active
            return res.status(401).json({ success: false, message: 'Account disabled' });
        }

        const isPasswordValid = await bcrypt.compare(password, user[3]);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const userId = user[0];
        const expiresIn = rememberMe ? '7d' : '24h';
        const token = jwt.sign(
            { userId, email, username: user[1] },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn }
        );

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (rememberMe ? 7 : 1));

        await executeQuery(
            `INSERT INTO user_sessions (session_id, user_id, ip_address, user_agent, expires_at) 
             VALUES (:sessionId, :userId, :ip, :userAgent, :expiresAt)`,
            {
                sessionId: token,
                userId,
                ip: req.ip,
                userAgent: req.get('user-agent'),
                expiresAt: expiryDate
            },
            { autoCommit: true }
        );

        await executeQuery(
            `INSERT INTO activity_logs (user_id, action, ip_address) 
             VALUES (:userId, 'LOGIN', :ip)`,
            { userId, ip: req.ip },
            { autoCommit: true }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                userId,
                username: user[1],
                email: user[2],
                firstName: user[4],
                lastName: user[5]
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// ==========================================
// LOGOUT ENDPOINT
// ==========================================

router.post('/logout', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (token) {
            await executeQuery(
                `UPDATE user_sessions SET is_active = 0 WHERE session_id = :sessionId`,
                { sessionId: token },
                { autoCommit: true }
            );
        }

        await executeQuery(
            `INSERT INTO activity_logs (user_id, action, ip_address) 
             VALUES (:userId, 'LOGOUT', :ip)`,
            { userId, ip: req.ip },
            { autoCommit: true }
        );

        res.clearCookie('token');

        res.json({ success: true, message: 'Logout successful' });

    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ success: false, message: 'Logout failed' });
    }
});

// ==========================================
// VERIFY TOKEN
// ==========================================

router.get('/verify', authenticate, (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;
