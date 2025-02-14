import express from 'express';
import { getChargingStations } from '../utils/getChargingStations.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Missing lat or lon parameters' });
  }

  try {
    const stations = await getChargingStations(lat, lon);
    res.status(200).json(stations);
  } catch (error) {
    console.error('Error fetching charging stations:', error.message);
    res.status(500).json({ message: 'Error fetching charging stations', error: error.message });
  }
});

export default router;
