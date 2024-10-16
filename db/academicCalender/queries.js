const AcademicCalender = require("./model");

module.exports = class AcademicCalenderData {
  static async create(data) {
    try {
      const result = await new AcademicCalender(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await AcademicCalender.find(filter)
        .populate("academicYear")
        .populate({ path: "semesters.semester", model: "Semester" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await AcademicCalender.findOne(filter)
        .populate("academicYear")
        .populate({ path: "semesters.semester", model: "Semester" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData, options = {}) {
    try {
      const result = await AcademicCalender.findOneAndUpdate(
        filter,
        updateData,
        options
      )
        .populate("academicYear")
        .populate({ path: "semesters.semester", model: "Semester" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await AcademicCalender.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
