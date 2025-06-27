// saveMessagesToDB.js
const { kafka } = require("./kafka");
const Chat = require("./models/Chat");

async function saveMessagesToDB(userId) {
  const consumer = kafka.consumer({ groupId: `group-${userId}` });

  await consumer.connect();
  await consumer.subscribe({ topic: `chat-${userId}`, fromBeginning: true });

  const messages = [];

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = JSON.parse(message.value.toString());
      if (message.key.toString() === userId) {
        messages.push(value);
      }
    },
  });

  // Delay to allow processing before disconnect
  setTimeout(async () => {
    if (messages.length > 0) {
      await Chat.create({ userId, messages, savedAt: new Date() });
      console.log(`💾 Saved ${messages.length} messages for user: ${userId}`);
    }

    await consumer.disconnect();
  }, 3000); // Give it time to finish consuming
}

module.exports = saveMessagesToDB;
