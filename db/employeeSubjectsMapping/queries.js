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
        .populate("subjects academicYear department degreeCode")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await EmployeeSubjectMapping.findOne(filter)
        .populate("subjects academicYear department degreeCode")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const result = await EmployeeSubjectMapping.findOneAndUpdate(
        filter,
        data,
        {
          new: true,
        }
      )
        .populate("subjects academicYear department degreeCode")
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
