import mongoose, { Connection, Document, Model } from 'mongoose';
import dotenv from 'dotenv';
import {IPushLog, PushLogSchema} from "../models/PushLog";
dotenv.config();

const mongodbUsername = process.env.MONGODB_USERNAME;
const mongodbPassword = process.env.MONGODB_PASSWORD;
const mongodbHost = process.env.MONGODB_HOST || 'localhost';
const mongodbPort = 27017;
const mongodbDatabase = process.env.MONGODB_DATABASE_NAME;

export let connection: Connection;
export let PushLog: Model<IPushLog & Document>;

export async function connectToPushDb() {
    const uri = `mongodb://${mongodbUsername}:${mongodbPassword}@${mongodbHost}:${mongodbPort}/${mongodbDatabase}?authSource=admin`;

    if (connection) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        // Create a connection to MongoDB
        connection = await mongoose.createConnection(uri).asPromise();

        console.log('MongoDB connected successfully');

        // Register your model with the connection
        PushLog = connection.model<IPushLog & Document>('PushSendLog', PushLogSchema);

        console.log('Model registered successfully');

    } catch (err) {
        console.error(`MongoDB connection to ${uri} failed:`, err);
    }
}
