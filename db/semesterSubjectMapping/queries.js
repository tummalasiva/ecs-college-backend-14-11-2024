const SemesterSubjectMapping = require("./model");

module.exports = class SemesterSubjectMappingData {
  static async create(data) {
    try {
      const result = await new SemesterSubjectMapping(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await SemesterSubjectMapping.findOne(filter)
        .populate("degreeCode subjects")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await SemesterSubjectMapping.find(filter)
        .populate("degreeCode subjects")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData, options = {}) {
    try {
      const result = await SemesterSubjectMapping.findOneAndUpdate(
        filter,
        updateData,
        { new: true, ...options }
      )
        .populate("degreeCode subjects")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await SemesterSubjectMapping.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
