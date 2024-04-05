import 'dotenv/config'
import mongoose from 'mongoose';
import mongoDBConnect from './mongoDB/connection.js';

mongoose.set('strictQuery', false);
mongoDBConnect();


