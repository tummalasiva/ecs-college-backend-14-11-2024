const semesterQuery = require("@db/semester/queries");
const degreeCodeQuery = require("@db/degreeCode/queries");
const semesterSubjectMappingQuery = require("@db/semesterSubjectMapping/queries");
const academicYearQuery = require("@db/academicYear/queries");
const subjectQuery = require("@db/subject/queries");
const studentQuery = require("@db/student/queries");
const schoolQuery = require("@db/school/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { notFoundError } = require("../../helper/helpers");

module.exports = class SemesterSubjectMappingService {
  static async create(req) {
    try {
      const { year, subjectIds, degreeCode, semester } = req.body;

      console.log(req.body, "gggggggggg");
      const [subjectData, degreeCodeData] = await Promise.all([
        subjectQuery.findAll({ _id: { $in: subjectIds } }),
        degreeCodeQuery.findOne({ _id: degreeCode }),
      ]);

      if (!subjectData) return notFoundError("Subjects not found");

      if (!degreeCodeData) return notFoundError("Degree Code not found");

      let semesterSubjectMappingExists =
        await semesterSubjectMappingQuery.findOne({
          degreeCode,
          year,
          semester,
        });

      if (semesterSubjectMappingExists) {
        return common.failureResponse({
          message:
            "Semester subject mapping already exists for the given configuration!",
          statusCode: httpStatusCode.conflict,
          responseCode: "CLIENT_ERROR",
        });
      }

      const semesterSubjectMapping = await semesterSubjectMappingQuery.create({
        semester,
        degreeCode,
        year,
        subjects: subjectIds,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Semester subject mapping created successfully",
        result: semesterSubjectMapping,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const filter = { ...search };

      const semesterSubjectMappings = await semesterSubjectMappingQuery.findAll(
        filter
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Semester subject mappings fetched successfully",
        result: semesterSubjectMappings,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const updatedSemesterSubjectMapping =
        await semesterSubjectMappingQuery.updateOne(
          { _id: req.params.id },
          { $set: req.body }
        );

      if (!updatedSemesterSubjectMapping)
        return common.failureResponse({
          message: "Semester subject mapping not found",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Semester subject mapping updated successfully",
        result: updatedSemesterSubjectMapping,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await semesterSubjectMappingQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Semester subject mapping deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  static async processSubjectAllocation(req) {
    try {
      const { semesterSubjectMappingId, academicYear } = req.body;

      const semesterSubjectMapping = await semesterSubjectMappingQuery.findOne({
        _id: semesterSubjectMappingId,
      });
      if (!semesterSubjectMapping)
        return common.failureResponse({
          message: "Semester subject mapping not found",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      let subjects = semesterSubjectMapping.subjects.map((s) => ({
        subject: s._id,
      }));
      let semesters = await semesterQuery.findAll({
        academicYear: academicYear,
      });
      if (!semesters.length)
        return common.failureResponse({
          message: "Semesters not found for the academic year",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      const school = await schoolQuery.findOne({
        _id: req.schoolId,
      });

      if (!school)
        return common.failureResponse({
          message: "School not found",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      let semesterToAssign =
        semesterSubjectMapping.semester === "First Academic Semester"
          ? semesters.find(
              (s) => (s.semesterName = school.academicSemester1?.name)
            )?._id
          : semesters.find(
              (s) => (s.semesterName = school.academicSemester2?.name)
            )?._id;

      await studentQuery.updateList(
        {
          "academicInfo.semester": semesterToAssign,
          "academicInfo.year": semesterSubjectMapping.year,
          academicYear: academicYear,
        },
        {
          $addToSet: {
            registeredSubjects: { $each: subjects },
          },
        }
      );

      await semesterSubjectMappingQuery.updateOne(
        { _id: semesterSubjectMappingId },
        { $addToSet: { allocatedAcademicYears: academicYear } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject allocation process completed successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
