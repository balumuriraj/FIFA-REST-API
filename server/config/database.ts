import * as mongoose from "mongoose";

mongoose.connect("mongodb://localhost/fifa_stats", {
  useMongoClient: true
});

export { mongoose };
