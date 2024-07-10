const StudentActivity = require("./model");

module.exports = class StudentActivityData {
  static async create(data) {
    try {
      const result = await new StudentActivity(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await StudentActivity.findOne(filter, projection)
        .populate("school addedBy student academicYear")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await StudentActivity.findOneAndUpdate(
        filter,
        update,
        options
      )
        .populate("school addedBy student academicYear")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await StudentActivity.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await StudentActivity.find(filter)
        .sort({ createdAt: -1 })
        .populate("school addedBy student academicYear")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await StudentActivity.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
