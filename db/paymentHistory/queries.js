const PaymentHistory = require("./model");

module.exports = class PaymentHistoryDataData {
  static async create(data) {
    try {
      const result = await new PaymentHistory(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await PaymentHistory.find(filter)
        .populate("school generatedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await PaymentHistory.findOne(filter)
        .populate("school generatedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await PaymentHistory.findOneAndUpdate(
        filter,
        data,
        options
      )
        .populate("school generatedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await PaymentHistory.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
