// src/config/kafka.ts
import { Kafka, Partitioners } from 'kafkajs';

export const kafka = new Kafka({
  clientId: process.env.SERVICE_NAME || 'user-service',
  brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
  retry: {
    retries: 5,
    initialRetryTime: 300,
    maxRetryTime: 15000,
  },
});

export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner // Use the legacy partitioner for backward compatibility
});
export const consumer = kafka.consumer({ groupId: process.env.SERVICE_NAME || 'user-service-group' });