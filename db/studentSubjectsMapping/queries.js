const StudentSubjectMapping = require("./model");

module.exports = class StudentSubjectMappingData {
  static async create(data) {
    try {
      const result = await new StudentSubjectMapping(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await StudentSubjectMapping.findOne(filter, projection)
        .populate("academicYear subject student")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update) {
    try {
      const result = await StudentSubjectMapping.findOneAndUpdate(
        filter,
        update
      )
        .populate("academicYear subject student")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await StudentSubjectMapping.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await StudentSubjectMapping.find(filter)
        .populate("academicYear subject student")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await StudentSubjectMapping.findOneAndDelete(
        filter
      ).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
