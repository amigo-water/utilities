// src/services/kafka.consumer.ts
import { EachMessagePayload } from 'kafkajs';
import { kafka, consumerConfig, TOPICS } from '../config/kafka';
import { Event } from '../models/event.model';

export class KafkaConsumer {
  private consumer = kafka.consumer(consumerConfig);
  private isConnected = false;

  public async start(): Promise<void> {
    if (this.isConnected) {
      console.log('Consumer is already running');
      return;
    }

    try {
      await this.consumer.connect();
      console.log('Kafka consumer connected');

      // Subscribe to billing events topic
      await this.consumer.subscribe({ 
        topic: TOPICS.BILLING_EVENTS,
        fromBeginning: false
      });

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.handleMessage(payload);
        },
      });

      this.isConnected = true;
      console.log('Kafka consumer is running');
    } catch (error) {
      console.error('Error starting Kafka consumer:', error);
      throw error;
    }
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;
    
    if (!message.value) {
      console.warn('Received empty message', { topic, partition, offset: message.offset });
      return;
    }

    try {
      const event = JSON.parse(message.value.toString());
      console.log('Received event:', event);

      // Store the event in the database
      await Event.create({
        eventType: event.eventType,
        serviceName: 'billing-service',
        eventData: event,
        status: 'processed',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          topic,
          partition,
          offset: message.offset.toString(),
        }
      });

      console.log('Event stored successfully');
      
    } catch (error) {
      console.error('Error processing message:', error, {
        topic,
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.consumer.disconnect();
      this.isConnected = false;
      console.log('Kafka consumer disconnected');
    } catch (error) {
      console.error('Error stopping Kafka consumer:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const kafkaConsumer = new KafkaConsumer();