const LeaveAuth = require("./model");

module.exports = class LeaveAuthData {
  static async create(data) {
    try {
      const result = await new LeaveAuth(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await LeaveAuth.find(filter)
        .populate("employees", "academicInfo basicInfo")
        .populate("canBeApprovedBy", "academicInfo basicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await LeaveAuth.findOne(filter)
        .populate("employees", "academicInfo basicInfo")
        .populate("canBeApprovedBy", "academicInfo basicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await LeaveAuth.findOneAndUpdate(filter, data, {
        new: true,
        ...options,
      })
        .populate("employees", "academicInfo basicInfo")
        .populate("canBeApprovedBy", "academicInfo basicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await LeaveAuth.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
