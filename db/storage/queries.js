const Storage = require("./model");

module.exports = class StorageData {
  static async create(data) {
    try {
      const result = await new Storage(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Storage.findOne(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await Storage.findOneAndUpdate(
        filter,
        update,
        options
      ).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await Storage.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Storage.find(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Storage.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
