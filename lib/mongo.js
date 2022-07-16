const { MongoClient, ObjectId } = require("mongodb");
const { config } = require("../config");

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const DB_NAME = encodeURIComponent(config.dbName);
const MONGO_URI = `mongodb+srv://${USER}:${PASSWORD}@${config.dbHost}/${DB_NAME}?retryWrites=true&w=majority`;

class MongoLib {
  constructor() {
    this.client = new MongoClient(MONGO_URI, { useNewUrlParser: true });
    this.dbName = DB_NAME;
  }

  async connect() {
    if (!MongoLib.connection) {
      MongoLib.connection = new Promise((resolve, reject) => {
        this.client.connect((err) => {
          console.log(MONGO_URI);
          if (Boolean(err)) {
            console.log("Unable to connect to database");
            reject(err);
            return;
          }
          const connection = this.client.db(this.dbName);
          resolve(connection);
          console.log("Connected succesfully to mongo");
        });
      });
    }

    return MongoLib.connection;
  }

  async getAll(collection, query) {
    return this.connect().then((db) => {
      return db.collection(collection).find(query).toArray();
    });
  }

  async get(collection, id) {
    const db = await this.connect();
    return db.collection(collection).findOne({ _id: ObjectId(id) });
  }

  async create(collection, data) {
    const db = await this.connect();
    const result_1 = db.collection(collection).insertOne(data);
    return result_1.insertedId;
  }

  async update(collection, id, data) {
    const db = await this.connect();
    const result_1 = db
      .collection(collection)
      .updateOne({ _id: ObjectId(id) }, { $set: data }, { upsert: true });
    return result_1.upsertedId || id;
  }

  async delete(collection, id) {
    const db = await this.connect();
    db.collection(collection).deleteOne({ _id: ObjectId(id) });
    return id;
  }
}

module.exports = MongoLib;
