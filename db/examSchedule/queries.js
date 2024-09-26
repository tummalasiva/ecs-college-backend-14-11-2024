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

  static async findOne(filter = {}, projection) {
    try {
      const result = await ExamSchedule.findOne(filter, projection)
        .populate("examTitle subject slot academicYear degreeCode")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await ExamSchedule.findOneAndUpdate(
        filter,
        update,
        options
      )
        .populate("examTitle subject slot academicYear degreeCode")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await ExamSchedule.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await ExamSchedule.find(filter)

        .populate("examTitle subject slot academicYear degreeCode")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await ExamSchedule.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
