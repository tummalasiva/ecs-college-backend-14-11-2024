const CourseAssignment = require("./model");

module.exports = class CourseAssignmentData {
  static async create(data) {
    try {
      const result = await new CourseAssignment(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}) {
    try {
      const result = await CourseAssignment.find(filter)
        .populate("subject section semester")
        .populate("students", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await CourseAssignment.findOne(filter)
        .populate("subject section semester")
        .populate("students", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await CourseAssignment.findOneAndUpdate(filter, data, {
        ...options,
        new: true,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await CourseAssignment.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
