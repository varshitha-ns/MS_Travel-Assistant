import express from 'express';
const router = express.Router();
import { registerUser,loginUser } from '../controllers/authController.js';
import {generateItinerary} from '../controllers/itineraryController.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/generate-itinerary', generateItinerary);

export default router;