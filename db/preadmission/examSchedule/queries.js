const ExamSchedule = require("./model");

module.exports = class ExamScheduleData {
  static async create(data) {
    try {
      const result = await new ExamSchedule(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await ExamSchedule.find(filter)
        .populate("school class academicYear exam")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await ExamSchedule.findOne(filter)
        .populate("school class academicYear exam")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await ExamSchedule.findOneAndUpdate(filter, data, options)
        .populate("school class academicYear exam")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await ExamSchedule.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
