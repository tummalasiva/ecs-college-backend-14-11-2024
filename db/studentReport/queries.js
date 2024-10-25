const StudentReport = require("./model");

module.exports = class StudentReportData {
  static async create(data) {
    try {
      const result = await new StudentReport(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter) {
    try {
      const result = await StudentReport.find(filter)
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
      const result = await StudentReport.findOne(filter)
        .populate("faculty", "academicInfo basicInfo")
        .populate("reports.semester")
        .populate("reports.addedBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async update(filter, update, options = {}) {
    try {
      const result = await StudentReport.updateOne(filter, update, options);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await StudentReport.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
