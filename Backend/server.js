import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';

const app = express();

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors()); // Permits React app running on port 5173 to contact this API safely
app.use(json()); // Parses incoming raw JSON requests directly onto req.body

// Route Bindings
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running stable on port ${PORT}`));