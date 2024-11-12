//Dependencies
const mongoose = require("mongoose");
const mongoose_autopopulate = require("mongoose-autopopulate");
const mongoose_timestamp = require("mongoose-timestamp");
const { elevateLog } = require("elevate-logger");

const logger = elevateLog.init();

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

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Other options...
};

module.exports = function () {
  let parameters = "";
  if (process.env.REPLICA_SET_NAME) {
    parameters = "?replicaSet=" + process.env.REPLICA_SET_NAME;
  }
  if (process.env.REPLICA_SET_NAME && process.env.REPLICA_SET_READ_PREFERENCE) {
    parameters += "&readPreference=" + process.env.REPLICA_SET_READ_PREFERENCE;
  }

  const db = mongoose.createConnection(
    process.env.MONGODB_URL + parameters,
    options
  );

  db.on("error", function () {
    logger.error("Database connection error:", {
      triggerNotification: true,
    });
  });

  db.once("open", function () {
    logger.info("Connected to DB");

    // Model for archived documents using `db` connection
    const ArchivedDocument = db.model(
      "ArchivedDocument",
      archivedDocumentSchema
    );

    // Archiving function
    async function archiveDocument(collectionName, document) {
      const archivedDoc = new ArchivedDocument({
        nameOfCollection: collectionName,
        document: document,
      });
      await archivedDoc.save();
    }

    // Global middleware for archiving on delete
    db.plugin((schema) => {
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

    // Apply additional plugins after connection
    db.plugin(mongoose_timestamp, {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    });
    db.plugin(mongoose_autopopulate);

    // Export `db` globally
    global.db = db;
  });
};
