const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://cloudnest-zeta.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes


const authRoutes = require('./routes/auth.routes');
const fileRoutes = require('./routes/file.routes');
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
const aiRoutes = require('./routes/ai.routes');
app.use('/api/ai', aiRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🚀 CloudNest API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});