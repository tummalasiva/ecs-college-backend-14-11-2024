const _ = require("lodash");
const fnArgs = require("fn-args");
const { promisify } = require("util");
const status = require("./status");
const migrationsDir = require("../env/migrationsDir");

module.exports = async (db) => {
  const downgraded = [];
  const statusItems = await status(db);
  const appliedItems = statusItems.filter(
    (item) => item.appliedAt !== "PENDING"
  );
  const lastAppliedItem = _.last(appliedItems);

  if (lastAppliedItem) {
    try {
      const migration = await migrationsDir.loadMigration(
        lastAppliedItem.fileName
      );
      const args = fnArgs(migration.down);
      const down = args.length > 1 ? promisify(migration.down) : migration.down;
      await down(db);
    } catch (err) {
      throw new Error(
        `Could not migrate down ${lastAppliedItem.fileName}: ${err.message}`
      );
    }

    const collectionName = process.env.MIGRATION_COLLECTION || "migrations";
    const collection = db.collection(collectionName);
    try {
      await collection.findOneAndDelete({ fileName: lastAppliedItem.fileName });
      downgraded.push(lastAppliedItem.fileName);
    } catch (err) {
      throw new Error(`Could not update changelog: ${err.message}`);
    }
  }

  return downgraded;
};
