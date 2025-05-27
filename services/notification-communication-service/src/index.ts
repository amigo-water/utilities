// src/index.ts
import express from 'express';
import { sequelize } from './config/database';
import { kafkaConsumer } from './services/kafka.consumer';

const app = express();
const port = process.env.PORT || 3007;

// Initialize database and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    
    // Sync database models
    await sequelize.sync();
    console.log('Database synced');
    
    // Start Kafka consumer
    await kafkaConsumer.start();
    
    // Start the server
    app.listen(port, () => {
      console.log(`Notification service running on port ${port}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await kafkaConsumer.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await kafkaConsumer.stop();
  process.exit(0);
});

// Start the application
startServer();