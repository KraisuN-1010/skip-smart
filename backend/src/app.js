import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: "Welcome to server",
  });
});

app.use('/api/auth', authRoutes);

export default app;