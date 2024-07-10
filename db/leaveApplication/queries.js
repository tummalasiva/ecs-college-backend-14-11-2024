const LeaveApplication = require("./model");

module.exports = class LeaveApplicationData {
  static async create(data) {
    try {
      const result = await new LeaveApplication(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await LeaveApplication.find(filter)
        .populate(
          "school applier applierRole leaveType academicYear approvedBy"
        )
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await LeaveApplication.findOne(filter)
        .populate(
          "school applier applierRole leaveType academicYear approvedBy"
        )
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await LeaveApplication.findOneAndUpdate(
        filter,
        data,
        options
      )
        .populate(
          "school applier applierRole leaveType academicYear approvedBy"
        )
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await LeaveApplication.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
