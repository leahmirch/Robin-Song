const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const path = require('path');

const db = admin.firestore();
const usersCollection = db.collection('users');

router.get('/', async (req, res) => {
    try {
        const snapshot = await usersCollection.get();
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        res.json({ data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

router.post('/', async (req, res) => {
    const { firstName, lastName, email } = req.body;

    try {
        const newUser = {
            firstName,
            lastName,
            email,
            createdAt: admin.firestore.Timestamp.now(),
        };
        const userRef = await usersCollection.add(newUser);
        res.status(201).json({ id: userRef.id, data: newUser });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: 'Error adding user' });
    }
});

module.exports = router;
