const ExamAttendance = require("./model");

module.exports = class ExamAttendanceData {
  static async create(data) {
    try {
      const result = await new ExamAttendance(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await ExamAttendance.findOne(filter, projection)
        .populate("examTerm class section studentsAttendence.student")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await ExamAttendance.findOneAndUpdate(
        filter,
        update,
        options
      )
        .populate("examTerm class section studentsAttendence.student")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await ExamAttendance.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await ExamAttendance.find(filter)
        .sort({ createdAt: -1 })
        .populate("examTerm class section studentsAttendence.student")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await ExamAttendance.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
