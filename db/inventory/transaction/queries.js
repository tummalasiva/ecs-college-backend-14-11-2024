const Transaction = require("./model");

module.exports = class TransactionData {
  static async create(data) {
    try {
      const result = await new Transaction(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Transaction.findOneAndUpdate(filter, data, {
        ...options,
        new: true,
      })
        .populate("school item from to createdBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Transaction.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter) {
    try {
      const result = await Transaction.find(filter)
        .populate("school item from to createdBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findOne(filter) {
    try {
      const result = await Transaction.findOne(filter)
        .populate("school item from to createdBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
