const mongoose = require('mongoose');

const databaseUrl = process.env.MONGO_URI 
const ConnectDatabase = async () => {
    try {
        await mongoose.connect(databaseUrl);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = {ConnectDatabase}