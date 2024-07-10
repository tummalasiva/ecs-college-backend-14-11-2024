const Exam = require("./model");

module.exports = class ExamData {
  static async create(data) {
    try {
      const result = await new Exam(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Exam.find(filter)
        .populate("school class academicYear")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Exam.findOne(filter)
        .populate("school class academicYear")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Exam.findOneAndUpdate(filter, data, options)
        .populate("school class academicYear")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Exam.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
