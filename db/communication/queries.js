const SMS = require("./model");

module.exports = class SMSData {
  static async create(data) {
    try {
      const result = await new SMS(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await SMS.findOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await SMS.find(filter).populate("school").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async updateOne(filter = {}, data, options) {
    try {
      const result = await SMS.findOneAndUpdate(filter, data, {
        ...options,
        new: true,
      })
        .populate("school")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await SMS.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async updateMany(filter = {}, update = {}) {
    try {
      const result = await SMS.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
