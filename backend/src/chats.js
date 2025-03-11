const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { sendMessageToChatGPT } = require('../src/chatController');

const db = admin.firestore();
const chatsCollection = db.collection('chats');

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const snapshot = await chatsCollection.where('userId', '==', userId).get();
        if (snapshot.empty) {
            return res.status(404).json({ data: [] });
        }

        const chats = [];
        snapshot.forEach(doc => {
            chats.push({ id: doc.id, ...doc.data() });
        });
        res.json({ data: chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Error fetching chats' });
    }
});

router.post('/', async (req, res) => {
    const { userId, title } = req.body;

    try {
        const chat = {
            userId,
            title,
            createdAt: admin.firestore.Timestamp.now(),
        };

        const chatRef = await chatsCollection.add(chat);
        res.status(201).json({ id: chatRef.id, data: chat });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: 'Error creating chat' });
    }
});

router.post('/message', async (req, res) => {
    console.log("Received ChatGPT request from frontend...");
    await sendMessageToChatGPT(req, res);
});

router.get('/:chatId/messages', async (req, res) => {
    const { chatId } = req.params;

    try {
        const messagesCollection = chatsCollection.doc(chatId).collection('messages');
        const snapshot = await messagesCollection.orderBy('timestamp', 'asc').get();

        if (snapshot.empty) {
            return res.status(404).json({ data: [] });
        }

        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        res.json({ data: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Error fetching messages' });
    }
});

module.exports = router;
