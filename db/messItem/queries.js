const MessItem = require("./model");

module.exports = class MessItemData {
  static async create(data) {
    try {
      const result = await new MessItem(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await MessItem.find(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await MessItem.findOne(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await MessItem.findOneAndUpdate(filter, data, {
        new: true,
        ...options,
      }).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await MessItem.deleteOne(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async deleteMany(filter) {
    try {
      const result = await MessItem.deleteMany(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async countDocuments(filter = {}) {
    try {
      const result = await MessItem.countDocuments(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
