const express = require('express');
const bodyParser = require('body-parser');
const birdsRoutes = require('./birds'); // Import the router from birds.js

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/birds', birdsRoutes); // Use the birds routes correctly

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
