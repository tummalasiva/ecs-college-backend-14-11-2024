const Meeting = require("./model");

module.exports = class MeetingData {
  static async create(data) {
    try {
      const result = await Meeting(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Meeting.findOne(filter, projection)
        .populate("school createdBy")
        .populate({ path: "employeeParticipants", model: "Employee" })
        .populate({ path: "studentParticipants", model: "Student" })
        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await Meeting.findOneAndUpdate(filter, update, options)
        .populate("school createdBy")
        .populate({ path: "employeeParticipants", model: "Employee" })
        .populate({ path: "studentParticipants", model: "Student" })
        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await Meeting.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const res = await Meeting.find(filter)
        .sort({ createdAt: -1 })
        .populate("school createdBy")
        .populate({ path: "employeeParticipants", model: "Employee" })
        .populate({ path: "studentParticipants", model: "Student" })
        .lean();

      return res;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Meeting.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
