const noticeQuery = require("@db/notice/queries");
const offeredSubjectQuery = require("@db/offeredSubject/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const degreeCodeQuery = require("@db/degreeCode/queries");
const semesterQuery = require("@db/semester/queries");
const academicYearQuery = require("@db/academicYear/queries");
const { notFoundError } = require("../../helper/helpers");
const studentQuery = require("@db/student/queries");
const subjectQuery = require("@db/subject/queries");

module.exports = class OfferedSubjectHelper {
  static async create(req) {
    try {
      const { degreeCode, semester, year, subjectIds } = req.body;
      if (!Array.isArray(subjectIds))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject IDs should be an array!",
          responseCode: "CLIENT_ERROR",
        });
      const currentcAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentcAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active academic year not found!",
          responseCode: "CLIENT_ERROR",
        });
      const [degreeCodeData, semesterData, subjectsData] = await Promise.all([
        degreeCodeQuery.findOne({ _id: degreeCode }),
        semesterQuery.findOne({
          _id: semester,
          academicYear: currentcAcademicYear._id,
        }),
        subjectQuery.findAll({ _id: { $in: subjectIds } }),
      ]);

      if (!degreeCodeData) return notFoundError("Degree code not found!");
      if (!semesterData) return notFoundError("Semester not found!");
      if (subjectsData.length !== subjectIds.length)
        return notFoundError("Some of the selected subjects were not found!");

      const updatedOfferings = await offeredSubjectQuery.updateOne(
        {
          degreeCode,
          academicYear: currentcAcademicYear._id,
          year,
          semester,
          createdBy: req.employee,
        },
        {
          $addToSet: {
            subjects: { $each: subjectIds },
          },
        },
        {
          upsert: true,
        }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Offered subjects created successfully!",
        result: updatedOfferings,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await offeredSubjectQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: list,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getOfferedSubjects(req) {
    try {
      const studentId = req.student?._id;

      let requestingStudent = await studentQuery.findOne({ _id: studentId });
      if (!requestingStudent)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student not found!",
          responseCode: "CLIENT_ERROR",
        });

      let offering = await offeredSubjectQuery.findOne({
        degreeCode: requestingStudent.academicInfo?.degreeCode?._id,
        semester: requestingStudent.academicInfo.semester?._id,
        year: requestingStudent.academicInfo.year,
        academicYear: requestingStudent.academicYear?._id,
        active: true,
      });

      if (!offering) {
        return common.failureResponse({
          statusCode: httpStatusCode.ok,
          message: "No subjects offered!",
          result: offering,
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Offered subjects fetched successfully!",
        result: offering.subjects,
      });
    } catch (error) {
      throw error;
    }
  }

  static async registerSubject(req) {
    try {
      const { subjectId } = req.body;
      const studentId = req.student?._id;

      let requestingStudent = await studentQuery.findOne({ _id: studentId });
      if (!requestingStudent)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student not found!",
          responseCode: "CLIENT_ERROR",
        });

      let offering = await offeredSubjectQuery.findOne({
        degreeCode: requestingStudent.academicInfo?.degreeCode?._id,
        semester: requestingStudent.academicInfo.semester?._id,
        year: requestingStudent.academicInfo.year,
        academicYear: requestingStudent.academicYear?._id,
      });

      if (!offering)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Offered subject not found!",
          responseCode: "CLIENT_ERROR",
        });

      let subjectInOffering = offering.subjects.find(
        (s) => s._id?.toHexString() === subjectId
      );

      if (!subjectInOffering || !offering.active)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Subject not found in this offered subject!",
          responseCode: "CLIENT_ERROR",
        });

      let student = await studentQuery.updateOne(
        {
          _id: studentId,
        },
        {
          $addToSet: { registeredSubjects: subjectId },
        }
      );

      await offeredSubjectQuery.updateOne(
        { _id: offering._id },
        { $addToSet: { registeredStudents: student } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject registered successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await offeredSubjectQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Offered subject deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async publishOfferedSubject(req) {
    try {
      const updatedOfferings = await offeredSubjectQuery.updateOne(
        { _id: req.params.id },
        { $set: { active: true } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Offered subject published successfully!",
        result: updatedOfferings,
      });
    } catch (error) {
      throw error;
    }
  }
};
