const internalExamQuery = require("@db/internalExam/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class InternalExamService {
  static async create(req) {
    try {
      const { subject, examTitle, passingMarks } = req.body;
    } catch (error) {}
  }
};
