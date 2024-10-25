const CoPoAssessmentDistribution = require("./model");

module.exports = class CoPoAssessmentDistributionData {
  static async create(data) {
    try {
      const result = await new CoPoAssessmentDistribution(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await CoPoAssessmentDistribution.find(filter)
        .populate("department")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await CoPoAssessmentDistribution.findOne(filter)
        .populate("department")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await CoPoAssessmentDistribution.findOneAndUpdate(
        filter,
        data,
        options
      )
        .populate("department")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await CoPoAssessmentDistribution.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
