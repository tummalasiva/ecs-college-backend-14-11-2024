const FacultyReport = require("./model");

module.exports = class FacultyReportData {
  static async create(data) {
    try {
      const result = await new FacultyReport(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter) {
    try {
      const result = await FacultyReport.find(filter)
        .populate("faculty", "academicInfo basicInfo")
        .populate("reports.semester")
        .populate("reports.addedBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await FacultyReport.findOne(filter)
        .populate("faculty", "academicInfo basicInfo")
        .populate("reports.semester")
        .populate("reports.addedBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update, options = {}) {
    try {
      const result = await FacultyReport.updateOne(filter, update, options);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await FacultyReport.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
