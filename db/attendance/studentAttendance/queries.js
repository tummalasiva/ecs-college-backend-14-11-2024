const StudentAttendance = require("./model");

module.exports = class StudentActivityData {
  static async create(data) {
    try {
      const result = await new StudentAttendance(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await StudentAttendance.findOne(filter, projection)
        .populate("subject student degreeCode section semester")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await StudentAttendance.findOneAndUpdate(
        filter,
        update,
        options
      )
        .populate("subject student degreeCode section semester")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await StudentAttendance.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await StudentAttendance.find(filter)
        .sort({ createdAt: -1 })
        .populate("subject student degreeCode section semester")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await StudentAttendance.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
