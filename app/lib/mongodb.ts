import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI as string; 
const options = {};
declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}
class Singleton {
  private static _instance: Singleton;
  private client: MongoClient;
  private clientPromise: Promise<MongoClient>;

  private constructor() {
    this.client = new MongoClient(uri, options);
    this.clientPromise = this.client.connect();
    this.clientPromise
      .then(() => {
        console.log("Successfully connected to MongoDB");
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
      });
    if (process.env.NODE_ENV === "development") {
      global._mongoClientPromise = this.clientPromise;
    }
  }

  public static get instance() {
    if (!this._instance) {
      this._instance = new Singleton();
    }
    return this._instance.clientPromise;
  }
}

const clientPromise = Singleton.instance;
  
// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;