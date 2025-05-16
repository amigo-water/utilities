// src/utils/shutdown.ts
import { consumer } from '../config/kafka';

export async function gracefulShutdown() {
  try {
    await consumer.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);