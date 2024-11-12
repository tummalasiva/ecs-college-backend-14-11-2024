//Dependencies
const mongoose = require("mongoose");
const mongoose_autopopulate = require("mongoose-autopopulate");
const mongoose_timestamp = require("mongoose-timestamp");

const archivedDocumentSchema = new mongoose.Schema({
  nameOfCollection: {
    type: String,
    required: true,
  },
  document: {
    type: Object,
    required: true,
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
});

const { elevateLog } = require("elevate-logger");
const logger = elevateLog.init();

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Other options...
};

module.exports = function () {
  // Added to remove depreciation warnings from logs.

  let parameters = "";
  if (process.env.REPLICA_SET_NAME) {
    parameters = "?replicaSet=" + process.env.REPLICA_SET_NAME;
  }
  if (process.env.REPLICA_SET_NAME && process.env.REPLICA_SET_READ_PREFERENCE) {
    parameters =
      parameters + "&readPreference=" + process.env.REPLICA_SET_READ_PREFERENCE;
  }

  let db;
  if (!parameters) {
    db = mongoose.createConnection(process.env.MONGODB_URL, options);
  } else {
    db = mongoose.createConnection(
      process.env.MONGODB_URL + parameters,
      options
    );
  }

  db.on("error", function () {
    logger.error("Database connection error:", {
      triggerNotification: true,
    });
  });

  let ArchivedDocument;

  db.once("open", function () {
    logger.info("Connected to DB");
    ArchivedDocument = db.model("ArchivedDocument", archivedDocumentSchema);
  });

  async function archiveDocument(collectionName, document) {
    const archivedDoc = new ArchivedDocument({
      nameOfCollection: collectionName,
      document: document,
    });
    await archivedDoc.save();
  }

  // Global middleware for archiving on delete
  mongoose.plugin((schema) => {
    schema.pre("findOneAndDelete", async function (next) {
      const docToDelete = await this.model.findOne(this.getQuery()); // Get the document to be deleted
      if (docToDelete) {
        await archiveDocument(this.model.modelName, docToDelete.toObject());
      }
      next();
    });

    schema.pre(
      "deleteOne",
      { document: true, query: false },
      async function (next) {
        const docToDelete = this;
        if (docToDelete) {
          await archiveDocument(
            this.constructor.modelName,
            docToDelete.toObject()
          );
        }
        next();
      }
    );
  });

  mongoose.plugin(mongoose_timestamp, {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  });

  mongoose.plugin(mongoose_autopopulate);

  global.db = db;
};
