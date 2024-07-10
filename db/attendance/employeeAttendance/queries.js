const EmployeeAttendance = require("./model");

module.exports = class EmployeeAttendanceData {
  static async create(data) {
    try {
      const result = await new EmployeeAttendance(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await EmployeeAttendance.findOne(filter, projection)
        .populate("school employee")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await EmployeeAttendance.findOneAndUpdate(
        filter,
        update,
        options
      )
        .populate("school employee")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await EmployeeAttendance.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await EmployeeAttendance.find(filter)
        .sort({ date: -1 })
        .populate("school employee")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await EmployeeAttendance.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
