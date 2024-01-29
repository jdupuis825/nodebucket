/**
 * Title: mongo.js
 * Author: Jocelyn Dupuis
 * Date: 1/18/2024
 * Description: js file to merge mongo db
 */

"use strict";

// require statements
const { MongoClient } = require("mongodb");
const config = require('./config');

//connecting string for MongoDB Atlas
const MONGO_URL = config.dbUrl;

const mongo = async(operations, next) => {
  //catches potential error
  try {
    console.log("Connecting to MongoDB...");

    //connect to the MongoDB cluster
    const client = await MongoClient.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    //selects the database
    const db = client.db(config.dbname);
    console.log("Connected to db.");

    //execute the passed in operation
    await operations(db);
    console.log("Operation was successful");

    //close the connection
    client.close();
    console.log('Closing connection to the MongoDB Atlas...')

  } catch (err) {
    //if error(s) caught throws error 500 status
    const error = new Error("Error connecting to db ", err);
    error.status = 500;

    //log out the error
    console.log("Error connecting to db: ", err);
    next(err);
  }
};
//exports
module.exports = { mongo };


