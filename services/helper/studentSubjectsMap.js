const studentSubjectMapQueries = require("@db/studentSubjectsMapping/queries");
const degreeCodeQueries = require("@db/degreeCode/queries");
const studentQueries = require("@db/student/queries");
const academicYearQueries = require("@db/academicYear/queries");
const subjectQueries = require("@db/subject/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { notFoundError } = require("../../helper/helpers");

module.exports = class StudentSubjectMappingHelper {
  static async assignSubjectToMultiple(req) {
    try {
      const { degreeCode, semester, subjectIds } = req.body;
      if (!Array.isArray(subjectIds))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject IDs should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let currentAcademicYear = await academicYearQueries.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found.",
          responseCode: "CLIENT_ERROR",
        });

      if (degreeCode !== "all") {
        const degreeCodeData = await degreeCodeQueries.findOne({
          _id: degreeCode,
        });
        if (!degreeCodeData) return notFoundError("Degree Code not found");

        let students = await studentQueries.findAll({
          "academicInfo.degreeCode": degreeCode,
          academicYear: currentAcademicYear._id,
          semester,
        });
        let studentIds = students.map((student) => student._id);

        let updatedMap = await studentSubjectMapQueries.updateList(
          {
            student: { $in: studentIds },
            semester,
            academicYear: currentAcademicYear._id,
          },
          { $addToSet: { registeredSubjects: { $each: subjectIds } } },
          { upsert: true }
        );

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Subjects assigned successfully!",
          responseCode: "SUCCESS",
          data: updatedMap,
        });
      } else {
        let allDegreeCodes = await degreeCodeQueries.findAll([]);
        let degreeCodeIds = allDegreeCodes.map((degreeCode) => degreeCode._id);

        let students = await studentQueries.findAll({
          "academicInfo.degreeCode": { $in: degreeCodeIds },
          academicYear: currentAcademicYear._id,
          semester,
        });
        let studentIds = students.map((student) => student._id);

        let updatedMap = await studentSubjectMapQueries.updateList(
          {
            student: { $in: studentIds },
            semester,
            academicYear: currentAcademicYear._id,
          },
          { $addToSet: { subjects: { $each: subjectIds } } },
          { upsert: true }
        );

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Subjects assigned successfully!",
          responseCode: "SUCCESS",
          data: updatedMap,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async assignSubjectsToSingle(req) {
    const { subjectIds, studentId, semester } = req.body;
    if (!Array.isArray(subjectIds))
      return common.failureResponse({
        statusCode: httpStatusCode.bad_request,
        message: "Subject IDs should be an array!",
        responseCode: "CLIENT_ERROR",
      });
    let currentAcademicYear = await academicYearQueries.findOne({
      active: true,
    });

    if (!currentAcademicYear)
      return common.failureResponse({
        statusCode: httpStatusCode.bad_request,
        message: "No active academic year found.",
        responseCode: "CLIENT_ERROR",
      });

    let studentData = await studentQueries.findOne({
      _id: studentId,
      academicYear: currentAcademicYear._id,
      semester,
    });

    const updatedMap = await studentSubjectMapQueries.updateOne(
      { student: studentId, semester, academicYear: currentAcademicYear._id },
      { $addToSet: {} }
    );
  }
};
