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

  // Wait briefly to allow Kafka to finish consuming
  setTimeout(async () => {
    if (messages.length > 0) {
      try {
        // Find existing chat
        const existingChat = await Chat.findOne({ userId });

        if (existingChat) {
          // Append messages to existing chat
          existingChat.messages.push(...messages);
          await existingChat.save();
          console.log(`🔄 Appended ${messages.length} messages for user: ${userId}`);
        } else {
          // Create new chat
          await Chat.create({ userId, messages, savedAt: new Date() });
          console.log(`💾 Created new chat with ${messages.length} messages for user: ${userId}`);
        }
      } catch (err) {
        console.error(`❌ Error saving messages for user ${userId}:`, err);
      }
    }

    await consumer.disconnect();
  }, 3000); // Adjust as needed based on Kafka throughput
}

module.exports = saveMessagesToDB;


// // saveMessagesToDB.js
// const { kafka } = require("./kafka");
// const Chat = require("./models/Chat");

// async function saveMessagesToDB(userId) {
//   const consumer = kafka.consumer({ groupId: `group-${userId}` });

//   await consumer.connect();
//   await consumer.subscribe({ topic: `chat-${userId}`, fromBeginning: true });

//   const messages = [];

//   await consumer.run({
//     eachMessage: async ({ message }) => {
//       const value = JSON.parse(message.value.toString());
//       if (message.key.toString() === userId) {
//         messages.push(value);
//       }
//     },
//   });

//   // Delay to allow processing before disconnect
//   setTimeout(async () => {
//     if (messages.length > 0) {
//       await Chat.create({ userId, messages, savedAt: new Date() });
//       console.log(`💾 Saved ${messages.length} messages for user: ${userId}`);
//     }

//     await consumer.disconnect();
//   }, 3000); // Give it time to finish consuming
// }

// module.exports = saveMessagesToDB;
