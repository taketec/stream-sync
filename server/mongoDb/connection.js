import { MongoClient } from "mongodb";

const mongoDBConnect = () => {
  try {
    MongoClient.connect(process.env.URL||'mongodb://localhost:27017/stream-sync', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB - Connected",process.env.URL);
  } catch (error) {
    console.log("Error - MongoDB Connection " + error);
  }
};
export default mongoDBConnect;
