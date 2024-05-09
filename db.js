function Db() {
    const mongoose = require("mongoose");
    const dotenv = require("dotenv");
    dotenv.config();
  
    const dbConnection = process.env.mongo_url;
    const Connection =    mongoose.connect(dbConnection, {      //previous code
    useNewUrlParser: true,
    useUnifiedTopology: true,
      });

  console.log("MongoDb is connected")
    return { Connection };
  }
  module.exports = Db;
  
