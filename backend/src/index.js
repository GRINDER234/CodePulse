const express = require('express');
const cors = require('cors');
const { fetchAllctsts, getCacheStats } = require('./services/contestServices');



const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/api/ping', (req, res) => {
    res.json({message: "CodePulse backend is pulsing active!" });
});

app.get('/api/contests', async (req, res) => {
    try {
        console.log("CodePulse receiving request for live contest data..");
        const ctsts = await fetchAllctsts();
        res.json({
            success: true,
            count: ctsts.length,
            data: ctsts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/stats', (req, res) => {
    res.json(getCacheStats());
});

app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});