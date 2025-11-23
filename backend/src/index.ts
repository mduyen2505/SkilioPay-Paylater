import express from 'express';
import cors from 'cors';
import paylaterRoutes from './routes/paylater.routes';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/paylater', paylaterRoutes);

// Default route
app.get('/', (_req, res) => {
  res.send('Hello from PayLater backend!');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});