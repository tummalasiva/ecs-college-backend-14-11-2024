const StudentExamResult = require("./model");

module.exports = class StudentExamResultData {
  static async create(data) {
    try {
      const result = await new StudentExamResult(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await StudentExamResult.find(filter)
        .populate("examTitle subject academicYear degreeCode semester")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await StudentExamResult.findOne(filter)
        .populate("examTitle subject academicYear degreeCode semester")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData) {
    try {
      const result = await StudentExamResult.findOneAndUpdate(
        filter,
        updateData,
        { new: true }
      )
        .populate("examTitle subject academicYear degreeCode semester")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await StudentExamResult.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
