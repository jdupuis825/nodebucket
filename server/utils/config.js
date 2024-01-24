/**
 * Title: mongo.js
 * Author: Jocelyn Dupuis
 * Date: 1/22/2024
 * Description: Js file to like with Mongo
 */

"use strict";

//db object
const db = {
  username: "nodebucket_user",
  password: "s3cret",
  name: "nodebucket"
};

const config = {
  port: 3000,
  dbUrl: `mongodb+srv://${db.username}:${db.password}@bellevueuniversity.t2iiezr.mongodb.net/${db.name}?retryWrites=true&w=majority`,
  dbname: db.name
};

//exports
module.exports = config;