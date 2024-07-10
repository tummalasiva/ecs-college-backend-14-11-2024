const Stop = require("./model");

module.exports = class StopData {
  static async create(data) {
    try {
      const result = await new Stop(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async insertMany(data) {
    try {
      const result = await Stop.insertMany(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter, projection = {}) {
    try {
      const result = await Stop.findOne(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}, projection = {}) {
    try {
      const result = await Stop.find(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await Stop.findOneAndUpdate(
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
      const result = await Stop.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Stop.findOneAndDelete(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
