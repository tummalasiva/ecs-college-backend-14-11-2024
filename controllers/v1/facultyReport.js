const facultyReportHelper = require("@services/helper/facultyReport");

module.exports = class FacultyReportController {
  async create(req) {
    try {
      const result = await facultyReportHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await facultyReportHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await facultyReportHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await facultyReportHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
