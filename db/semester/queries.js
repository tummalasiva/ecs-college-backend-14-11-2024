const Semester = require("./model");

module.exports = class SemesterData {
  static async create(data) {
    try {
      const result = await new Semester(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const semesters = await Semester.find(filter)
        .populate("academicYear")
        .lean();
      return semesters;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const semester = await Semester.findOne(filter)
        .populate("academicYear")
        .lean();
      return semester;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update) {
    try {
      const semester = await Semester.findOneAndUpdate(filter, update, {
        new: true,
      })
        .populate("academicYear")
        .lean();
      return semester;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Semester.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
