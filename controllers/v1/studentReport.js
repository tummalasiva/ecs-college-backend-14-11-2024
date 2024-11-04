const studentReportHelper = require("@services/helper/studentReport");

module.exports = class StudentReportController {
  async create(req) {
    try {
      const result = await studentReportHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await studentReportHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await studentReportHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async removeReport(req) {
    try {
      const result = await studentReportHelper.removeReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
