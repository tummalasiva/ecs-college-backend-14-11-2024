const studentActivityQuery = require("@db/studentActivity/queries");
const academicYearQuery = require("@db/academicYear/queries");
const studentQuery = require("@db/student/queries");

const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class StudentActivityService {
  static async create(body) {
    try {
      const { academicYear, student, name, description, date } = body;

      const academicYearExists = await academicYearQuery.findOne({
        _id: academicYear,
      });
      if (!academicYearExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Academic Year not found!",
          rresponseCode: "CLIENT_ERROR",
        });

      const studentExists = await studentQuery.findOne({ _id: student });
      if (!studentExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student not found!",
          rresponseCode: "CLIENT_ERROR",
        });

      const newStudentActivity = await studentActivityQuery.create(body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student activity added successfully!",
        result: newStudentActivity,
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
      let studentActivities = await studentActivityQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: studentActivities,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body) {
    try {
      const { academicYear, student, name, description, date } = body;

      let activityExists = await studentActivityQuery.findOne({ _id: id });
      if (!activityExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student activity not found!",
          responseCode: "CLIENT_ERROR",
        });

      const academicYearExists = await academicYearQuery.findOne({
        _id: academicYear,
      });
      if (!academicYearExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Academic Year not found!",
          rresponseCode: "CLIENT_ERROR",
        });

      const studentExists = await studentQuery.findOne({ _id: student });
      if (!studentExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student not found!",
          rresponseCode: "CLIENT_ERROR",
        });

      const newStudentActivity = await studentActivityQuery.updateOne(
        { _id: id },
        body,
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student activity updated successfully",
        result: newStudentActivity,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let classes = await studentActivityQuery.delete({ _id: id });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student activity deleted successfully!",
        result: classes,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let studentActivity = await studentActivityQuery.findOne({ _id: id });

      if (studentActivity) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          result: studentActivity,
        });
      } else {
        return common.failureResponse({
          message: "Student activity not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
