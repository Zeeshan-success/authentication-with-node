// kafka.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'kellybot-chat',
  brokers: ['localhost:9092'], // adjust to your Kafka broker address
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'chat-group' });

module.exports = { kafka, producer, consumer };
