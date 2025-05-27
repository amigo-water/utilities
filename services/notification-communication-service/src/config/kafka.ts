// src/config/kafka.ts
import { Kafka, ConsumerConfig } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'notification-communication-service',
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
});

export const consumerConfig: ConsumerConfig = {
  groupId: 'notification-communication-group',
//   sessionTimeout: 30000,
  rebalanceTimeout: 30000,
  heartbeatInterval: 3000,
};

export const TOPICS = {
    
  BILLING_EVENTS: 'billing.events',
} as const;

export const BILLING_EVENT_TYPES = {
  BILL_CREATED: 'BILL_CREATED',
} as const;

export { kafka };