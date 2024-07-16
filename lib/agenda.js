const { Agenda } = require("agenda");
const { default: mongoose } = require("mongoose");

const DB = "ecs";

const dbURL = `mongodb://127.0.0.1:27017/${DB}`;

const agenda = new Agenda({
  mongo: mongoose.connection,
  db: { address: dbURL, collection: "Agenda" },
  processEvery: "20 seconds",
  useUnifiedTopology: true,
  maxConcurrency: 10000,
  defaultConcurrency: 50,
  defaultLockLifetime: 5000,
});

module.exports = agenda;
