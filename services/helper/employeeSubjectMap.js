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
      const { degreeCodeId, employeeId, subjectData, semester, year } =
        req.body;
      if (!Array.isArray(subjectData))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject Data should be an array!",
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

      for (let subData of subjectData) {
        let employeeMapExists = await employeeSubjectMapQueries.findOne({
          degreeCode: degreeCodeData._id,
          employee: employeeData._id,
          academicYear: currentAcademicYear._id,
          semester,
          year,
          "subjects.subject": subData.subject,
          "subjects.section": subData.section,
        });

        if (employeeMapExists)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message:
              "Subject in this section already assigned for this employee!",
            responseCode: "CLIENT_ERROR",
          });
      }

      let updatedMap = await employeeSubjectMapQueries.updateOne(
        {
          degreeCode: degreeCodeData._id,
          employee: employeeData._id,
          academicYear: currentAcademicYear._id,
          semester,
          year,
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
      const { academicYear, degreeCode, semester, section, year } = req.query;

      let currentAcademicYear = await academicYearQueries.findOne({
        active: true,
      });

      let filter = {
        employee: req.employee,
        academicYear: academicYear || currentAcademicYear._id,
        degreeCode,
        semester,
        section,
        year,
      };
      let response = await employeeSubjectMapQueries.findOne(filter);

      const subjects = response.sujects;
      const result = subjects
        .filter((s) => s.section?._id?.toString() === section)
        .map((s) => s.subject);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async myFilters(req) {
    try {
      const { academicYear } = req.query;

      // degreeCode semester section subjects

      let currentAcademicYear = await academicYearQueries.findOne({
        active: true,
      });

      let acadYear = academicYear || currentAcademicYear._id;
      let filter = {
        academicYear: acadYear,
        employee: req.employee,
      };

      let response = await employeeSubjectMapQueries.findAll(filter);

      let semesterData = response.map((s) => s.semester);

      let sectionData = [];

      for (let res of response) {
        sectionData.push({
          semester: res.semester,
          sections: res.subjects.map((s) => ({
            ...s.section,
            semester: res.semester,
          })),
        });
      }

      let subjectsData = [];
      for (let res of response) {
        subjectsData.push({
          semester: res.semester,
          subjects: res.subjects.map((s) => s.subject),
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: { semesterData, sectionData, subjectsData },
      });
    } catch (error) {
      throw error;
    }
  }
};
