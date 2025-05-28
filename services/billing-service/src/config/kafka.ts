import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'billing-service',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
})

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'billing-service'});

export const connectToKafka = async () => {
    await producer.connect();
    await consumer.connect();
    console.log('Connected to Kafka');

    
}