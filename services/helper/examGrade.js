const examGradeQuery = require("@db/examGrade/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class ExamGradeService {
  static async create(bodyData) {
    try {
      const newExamGrade = await examGradeQuery.create(bodyData);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Grade added successfully!",
        result: newExamGrade,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }
      let examTerms = await examGradeQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: examTerms,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body) {
    try {
      const updatedExamGrade = await examGradeQuery.updateOne(
        { _id: id },
        body,
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Grade updated successfully!",
        result: updatedExamGrade,
      });
    } catch (error) {
      return error;
    }
  }

  static async delete(id, userId) {
    try {
      let examGrade = await examGradeQuery.delete({ _id: id });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Grade deleted successfully!",
        result: examGrade,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let examGrade = await examGradeQuery.findOne({ _id: id });

      if (examGrade) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          result: examGrade,
        });
      } else {
        return common.failureResponse({
          message: "Grade not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
