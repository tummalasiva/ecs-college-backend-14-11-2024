const COoutcome = require("./model");

module.exports = class POOutcomeData {
  static async create(data) {
    try {
      const result = await new COoutcome(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const results = await COoutcome.find(filter)
        .populate("degreeCode subject")
        .lean();
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await COoutcome.findOne(filter)
        .populate("degreeCode subject")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData) {
    try {
      const result = await COoutcome.findOneAndUpdate(filter, updateData, {
        new: true,
      })
        .populate("degreeCode subject")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await COoutcome.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
