// src/services/kafka.service.ts
import { producer, consumer } from '../config/kafka';

export class KafkaService {
  private static instance: KafkaService;
  private initialized = false;
  private subscribedTopics = new Set<string>();

  private constructor() {}

  static getInstance(): KafkaService {
    if (!KafkaService.instance) {
      KafkaService.instance = new KafkaService();
    }
    return KafkaService.instance;
  }

  async init() {
    if (this.initialized) return;

    if (!producer || !consumer) throw new Error('Kafka not configured properly');

    await producer.connect();
    await consumer.connect();

    this.initialized = true;
    console.log('Kafka Producer and Consumer connected');
  }

  async publish(topic: string, message: any) {
    try {
      if (!this.initialized) {
        await this.init();
      }

      await producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message),
            key: message.userId || message.id || null,
          },
        ],
      });
    } catch (error) {
      console.error(`❌ Error publishing to topic ${topic}:`, error);
      throw error;
    }
  }

  async subscribeMany(topics: string[], handler: (topic: string, message: any) => Promise<void>) {
    try {
      if (!this.initialized) {
        await this.init();
      }

      for (const topic of topics) {
        if (!this.subscribedTopics.has(topic)) {
          await consumer.subscribe({ topic });
          this.subscribedTopics.add(topic);
        }
      }

      await consumer.run({
        eachMessage: async ({ topic, message }) => {
          try {
            const data = JSON.parse(message.value?.toString() || '{}');
            await handler(topic, data);
          } catch (err) {
            console.error(`Error handling message from ${topic}:`, err);
          }
        },
      });
    } catch (error) {
      console.error(`❌ Error during subscription:`, error);
      throw error;
    }
  }
}
