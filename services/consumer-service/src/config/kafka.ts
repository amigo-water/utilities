// src/config/kafka.ts
import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: process.env.SERVICE_NAME || 'notification-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  retry: {
    retries: 5,
    initialRetryTime: 300,
    maxRetryTime: 15000,
  },
//   logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ 
  groupId: process.env.SERVICE_NAME || 'notification-service-consumer',
  allowAutoTopicCreation: true
});