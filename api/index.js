import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDB } from '../server/db/connection.js';
import authRoutes from '../server/routes/auth.js';
import postRoutes from '../server/routes/posts.js';
import inquiryRoutes from '../server/routes/inquiries.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', inquiryRoutes);

connectDB().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

export default app;
