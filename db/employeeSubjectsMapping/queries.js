const EmployeeSubjectMapping = require("./model");

module.exports = class EmployeeSubjectMappingData {
  static async create(data) {
    try {
      const result = await new EmployeeSubjectMapping(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await EmployeeSubjectMapping.find(filter)
        .populate("academicYear degreeCode semester employee")
        .populate({
          path: "subjects.subject",
          model: "Subject",
        })
        .populate({
          path: "subjects.section",
          model: "Section",
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await EmployeeSubjectMapping.findOne(filter)
        .populate("academicYear degreeCode semester employee")
        .populate({
          path: "subjects.subject",
          model: "Subject",
        })
        .populate({
          path: "subjects.section",
          model: "Section",
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await EmployeeSubjectMapping.findOneAndUpdate(
        filter,
        data,
        options
      )
        .populate("academicYear degreeCode semester employee")
        .populate({
          path: "subjects.subject",
          model: "Subject",
        })
        .populate({
          path: "subjects.section",
          model: "Section",
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await EmployeeSubjectMapping.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
