const studentExamResultQuery = require("@db/studentExamResult/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");

module.exports = class StudentExamResultHelper {
  static async create(req) {}

  static async list(req) {
    try {
      // academicYear, degreeCode, semester, registrationNumber, examTitle
      const { search = {} } = req.query;
      const result = await studentExamResultQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result,
      });
    } catch (error) {
      throw error;
    }
  }
};
