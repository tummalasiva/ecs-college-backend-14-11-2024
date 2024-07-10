const Receipt = require("./model");

module.exports = class ReceiptData {
  static async create(data) {
    try {
      const result = await new Receipt(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findOne(filter = {}, projection = {}) {
    try {
      const result = await Receipt.findOne(filter, projection)
        .populate("school feeMap collectedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}, projection = {}) {
    try {
      const result = await Receipt.find(filter, projection)
        .populate("school feeMap collectedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Receipt.findOneAndUpdate(filter, data, options)
        .populate("school feeMap collectedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async updateMany(filter, data, options = {}) {
    try {
      const result = await Receipt.updateMany(filter, data, options);

      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter) {
    try {
      const result = await Receipt.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
