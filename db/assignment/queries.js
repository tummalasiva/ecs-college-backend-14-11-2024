const Assignment = require("./model");

module.exports = class AssignmentData {
  static async create(data) {
    try {
      const result = await new Assignment(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Assignment.findOne(filter, projection)
        .populate("school class section subject")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await Assignment.findOneAndUpdate(filter, update, options)
        .populate("school class section subject")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await Assignment.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Assignment.find(filter)
        .sort({ createdAt: -1 })
        .populate("school class section subject")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Assignment.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
