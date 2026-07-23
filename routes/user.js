const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// ==========================================
// GET PROFILE
// ==========================================

router.get('/profile', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await executeQuery(
            `SELECT user_id, username, email, first_name, last_name, phone, address, 
                    city, state, postal_code, country, is_active, created_at 
             FROM users WHERE user_id = :userId`,
            { userId }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            user: {
                userId: user[0],
                username: user[1],
                email: user[2],
                firstName: user[3],
                lastName: user[4],
                phone: user[5],
                address: user[6],
                city: user[7],
                state: user[8],
                postalCode: user[9],
                country: user[10],
                isActive: user[11],
                createdAt: user[12]
            }
        });

    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});

// ==========================================
// UPDATE PROFILE
// ==========================================

router.put('/profile', authenticate, [
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('phone').optional().trim(),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('state').optional().trim(),
    body('postalCode').optional().trim(),
    body('country').optional().trim()
], async (req, res) => {
    try {
        const userId = req.user.userId;
        const { firstName, lastName, phone, address, city, state, postalCode, country } = req.body;

        await executeQuery(
            `UPDATE users 
             SET first_name = NVL(:firstName, first_name),
                 last_name = NVL(:lastName, last_name),
                 phone = NVL(:phone, phone),
                 address = NVL(:address, address),
                 city = NVL(:city, city),
                 state = NVL(:state, state),
                 postal_code = NVL(:postalCode, postal_code),
                 country = NVL(:country, country),
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = :userId`,
            {
                userId,
                firstName: firstName || null,
                lastName: lastName || null,
                phone: phone || null,
                address: address || null,
                city: city || null,
                state: state || null,
                postalCode: postalCode || null,
                country: country || null
            },
            { autoCommit: true }
        );

        res.json({ success: true, message: 'Profile updated' });

    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

// ==========================================
// CHANGE PASSWORD
// ==========================================

router.post('/change-password', authenticate, [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 })
], async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        const result = await executeQuery(
            `SELECT password FROM users WHERE user_id = :userId`,
            { userId }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isValid = await bcrypt.compare(currentPassword, result.rows[0][0]);

        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Current password incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await executeQuery(
            `UPDATE users SET password = :newPassword WHERE user_id = :userId`,
            { userId, newPassword: hashedPassword },
            { autoCommit: true }
        );

        res.json({ success: true, message: 'Password changed' });

    } catch (err) {
        console.error('Password change error:', err);
        res.status(500).json({ success: false, message: 'Password change failed' });
    }
});

// ==========================================
// GET ACTIVITY LOG
// ==========================================

router.get('/activity-log', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = req.query.limit || 10;

        const result = await executeQuery(
            `SELECT log_id, action, ip_address, details, created_at 
             FROM activity_logs 
             WHERE user_id = :userId 
             ORDER BY created_at DESC 
             FETCH FIRST :limit ROWS ONLY`,
            { userId, limit: parseInt(limit) }
        );

        const logs = result.rows.map(row => ({
            logId: row[0],
            action: row[1],
            ipAddress: row[2],
            details: row[3],
            createdAt: row[4]
        }));

        res.json({ success: true, logs });

    } catch (err) {
        console.error('Activity log error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch logs' });
    }
});

module.exports = router;
