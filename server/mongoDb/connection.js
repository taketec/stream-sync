import mongoose from "mongoose";

const mongoDBConnect = () => {
  try {
    mongoose.connect(process.env.URL||'mongodb://localhost:27017/chat-app-v2', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("MongoDB - Connected at " + process.env.URL);
  } catch (error) {
    console.log("Error - MongoDB Connection " + error);
  }
};
export default mongoDBConnect;
