const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, './service-key.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const birdsCollection = db.collection('birds');

// GET all bird data
router.get('/', async (req, res) => {
  try {
    const snapshot = await birdsCollection.get();
    const birds = [];
    snapshot.forEach(doc => {
      birds.push({ id: doc.id, ...doc.data() });
    });
    res.json({ data: birds });
  } catch (error) {
    console.error('Error fetching bird data:', error);
    res.status(500).json({ error: 'Error fetching bird data' });
  }
});

// GET latest bird data
router.get('/latest', async (req, res) => {
  try {
    const snapshot = await birdsCollection.orderBy('timestamp', 'desc').limit(1).get();
    if (snapshot.empty) {
      return res.json({ data: [] });
    }
    const latest = snapshot.docs[0].data();
    res.json({ data: latest });
  } catch (error) {
    console.error('Error fetching latest bird data:', error);
    res.status(500).json({ error: 'Error fetching latest bird data' });
  }
});

// POST bird data entry
router.post('/', async (req, res) => {
  const { bird, latitude, longitude } = req.body;
  try {
    const newBird = {
      bird,
      latitude,
      longitude,
      timestamp: admin.firestore.Timestamp.now(),
    };
    const docRef = await birdsCollection.add(newBird);
    res.status(201).json({ id: docRef.id, data: newBird });
  } catch (error) {
    console.error('Error adding bird data:', error);
    res.status(500).json({ error: 'Error adding bird data' });
  }
});

module.exports = router; // Ensure only the router is exported
