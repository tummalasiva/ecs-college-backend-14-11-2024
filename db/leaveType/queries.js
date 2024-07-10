const LeaveType = require("./model");

module.exports = class LeaveTypeData {
  static async create(data) {
    try {
      const result = await new LeaveType(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await LeaveType.find(filter)
        .populate("school")
        .populate({ path: "departments", model: "Department" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await LeaveType.findOne(filter)
        .populate("school")
        .populate({ path: "departments", model: "Department" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await LeaveType.findOneAndUpdate(filter, data, options)
        .populate("school")
        .populate({ path: "departments", model: "Department" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await LeaveType.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
