const GuardianFeedback = require("./model");

module.exports = class GuardianFeedbackData {
  static async create(data) {
    try {
      const result = await new GuardianFeedback(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await GuardianFeedback.findOne(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await GuardianFeedback.findOneAndUpdate(
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
      const result = await GuardianFeedback.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await GuardianFeedback.find(filter)
        .sort({ createdAt: -1 })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await GuardianFeedback.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
