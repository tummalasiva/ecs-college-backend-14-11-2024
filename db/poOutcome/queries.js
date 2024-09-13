const POoutcome = require("./model");

module.exports = class POOutcomeData {
  static async create(data) {
    try {
      const result = await new POoutcome(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const results = await POoutcome.find(filter)
        .populate("degreeCode")
        .lean();
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await POoutcome.findOne(filter)
        .populate("degreeCode")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData) {
    try {
      const result = await POoutcome.findOneAndUpdate(filter, updateData, {
        new: true,
      })
        .populate("degreeCode")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await POoutcome.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
