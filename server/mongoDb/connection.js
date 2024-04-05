import { MongoClient } from "mongodb";

const mongoDBConnect = () => {
  try {
    MongoClient.connect(process.env.URL||'mongodb://localhost:27017/chat-app-v2', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("MongoDB - Connected");
  } catch (error) {
    console.log("Error - MongoDB Connection " + error);
  }
};
export default mongoDBConnect;
