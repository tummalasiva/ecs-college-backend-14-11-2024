const CourseOutcome = require("./model");

module.exports = class CourseOutcomeData {
  static async create(data) {
    try {
      const result = await new CourseOutcome(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const results = await CourseOutcome.find(filter)
        .populate("degreeCode subject")
        .lean();
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await CourseOutcome.findOne(filter)
        .populate("degreeCode subject")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData) {
    try {
      const result = await CourseOutcome.findOneAndUpdate(filter, updateData, {
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
      const result = await CourseOutcome.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
