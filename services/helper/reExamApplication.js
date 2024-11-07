const reExamApplicationQuery = require("@db/reExamApplication/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class ReExamApplicationService {
  static async create(req) {
    try {
      const { subject, reason, examName } = req.body;

      let data = { ...req.body, student: req.student };

      const newApplication = await reExamApplicationQuery.create(data);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Application submitted successfully",
        result: newApplication,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const filter = { ...search };

      const allApplications = await reExamApplicationQuery.list(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "All applications fetched successfully",
        result: allApplications,
      });
    } catch (error) {
      throw error;
    }
  }
};
