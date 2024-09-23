const employeeSubjectMapQueries = require("@db/employeeSubjectsMapping/queries");
const degreeCodeQueries = require("@db/degreeCode/queries");
const employeeQueries = require("@db/employee/queries");
const academicYearQueries = require("@db/academicYear/queries");
const subjectQueries = require("@db/subject/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { notFoundError } = require("../../helper/helpers");

module.exports = class EmployeeSubjectsMappingHelper {
  static async assignSubjects(req) {
    try {
      const { degreeCodeId, employeeId, subjectData, semester } = req.body;
      if (!Array.isArray(subjectData))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject IDs should be an array!",
          responseCode: "CLIENT_ERROR",
        });
      const [degreeCodeData, employeeData] = await Promise.all([
        degreeCodeQueries.findOne({ _id: degreeCodeId }),
        employeeQueries.findOne({ _id: employeeId }),
      ]);

      if (!degreeCodeData) return notFoundError("Degree Code not found");
      if (!employeeData) return notFoundError("Employee not found");

      let currentAcademicYear = await academicYearQueries.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return notFoundError("Current academic Year not found");

      let updatedMap = await employeeSubjectMapQueries.updateOne(
        {
          degreeCode: degreeCodeData._id,
          employee: employeeData._id,
          academicYear: currentAcademicYear._id,
          semester,
        },
        { $addToSet: { subjects: { $each: subjectData } } },
        { upsert: true, new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subjects assigned successfully!",
        responseCode: "SUCCESS",
        data: updatedMap,
      });
    } catch (error) {
      throw error;
    }
  }

  static async removeSubject(req) {
    try {
      const { employeeId, subjectId, degreeCode, academicYear, semester } =
        req.body;
      let updatedEmployeesSubjects = await employeeSubjectMapQueries.updateOne(
        {
          employee: employeeId,
          degreeCode: degreeCode,
          academicYear: academicYear,
          semester,
        },
        {
          $pull: {
            subjects: { "subject._id": subjectId },
          },
        },
        {
          new: true,
        }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject removed successfully!",
        responseCode: "SUCCESS",
        data: updatedEmployeesSubjects,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let result = await employeeSubjectMapQueries.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async mySubjects(req) {
    try {
      const { degreeCode, academicYear, semester } = req.query;
      let result = await employeeSubjectMapQueries.find({
        employee: req.employee,
        degreeCode,
        academicYear,
        semester,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result,
      });
    } catch (error) {
      throw error;
    }
  }
};
