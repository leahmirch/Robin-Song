import express from 'express';
import bodyParser from 'body-parser';
import birdRoutes from './routes/birdRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api/birds', birdRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
