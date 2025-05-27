import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import { connectToKafka } from './config/kafka';
import billingRoutes from './routes/billing.routes';

dotenv.config();

const app = express();
app.use(express.json());

// Database connection
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await connectToKafka();
    // Sync all models with the database
    await sequelize.sync({ force: true });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Initialize database connection
connectToDatabase();

// Routes
app.use('/billing', billingRoutes);

// Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'ok', message: 'Billing service is running' });
// });

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Billing service running on port ${PORT}`);
});
