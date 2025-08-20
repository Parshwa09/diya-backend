import express from 'express';
import { body, validationResult } from 'express-validator';
import Contact from '../models/Contact.js';

const router = express.Router();

// Validation middleware
const contactValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters')
];

// POST route for contact form
router.post('/', contactValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, message } = req.body;

        // Create new contact entry
        const newContact = new Contact({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            message: message.trim()
        });

        const savedContact = await newContact.save();

        res.status(201).json({
            success: true,
            message: 'Thank you for your message! I will get back to you soon.',
            data: {
                id: savedContact._id,
                name: savedContact.name,
                email: savedContact.email,
                createdAt: savedContact.createdAt
            }
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            error: 'Something went wrong while saving your message. Please try again later.'
        });
    }
});

// GET route to retrieve all contacts (for admin purposes)
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contacts'
        });
    }
});

export default router;
