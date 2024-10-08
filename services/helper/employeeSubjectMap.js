const employeeSubjectMapQueries = require("@db/employeeSubjectsMapping/queries");
const degreeCodeQueries = require("@db/degreeCode/queries");
const employeeQueries = require("@db/employee/queries");
const academicYearQueries = require("@db/academicYear/queries");
const subjectQueries = require("@db/subject/queries");
const semesterQuery = require("@db/semester/queries");
const timeTableQuery = require("@db/studentTimeTable/queries");
const labBatchQuery = require("@db/labBatch/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const moment = require("moment");
const { notFoundError } = require("../../helper/helpers");
const EmployeeSubjectMapping = require("@db/employeeSubjectsMapping/model");
const { default: mongoose } = require("mongoose");

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
      // degreeCode semester section subjects

      let currentAcademicYear = await academicYearQueries.findOne({
        active: true,
      });

      let activeSemester = await semesterQuery.findOne({
        academicYear: currentAcademicYear._id,
        active: true,
      });

      if (!activeSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Active semester not found",
          responseCode: "CLIENT_ERROR",
        });

      let acadYear = currentAcademicYear._id;
      let filter = {
        academicYear: acadYear,
        employee: mongoose.Types.ObjectId(req.employee),
        semester: activeSemester._id,
      };

      console.log(filter, "filter");

      const result = await EmployeeSubjectMapping.aggregate([
        { $match: filter }, // Match the filter criteria
        {
          $unwind: "$subjects", // Unwind the subjects array to process each subject separately
        },
        {
          $lookup: {
            from: "subjects", // Referencing the Subject model
            localField: "subjects.subject",
            foreignField: "_id",
            as: "subjectDetails",
          },
        },
        {
          $lookup: {
            from: "sections", // Referencing the Section model
            localField: "subjects.section",
            foreignField: "_id",
            as: "sectionDetails",
          },
        },
        {
          $group: {
            _id: {
              year: "$year", // Group by year
              section: "$subjects.section", // Group by section
            },
            sectionDetails: {
              $first: { $arrayElemAt: ["$sectionDetails", 0] },
            }, // Keep full section details
            subjects: {
              $push: {
                $arrayElemAt: ["$subjectDetails", 0], // Push full subject details
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id.year", // Group by year to structure the output
            sections: {
              $push: {
                section: "$sectionDetails", // Section details
                subjects: "$subjects", // Subjects under this section
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            years: { $addToSet: "$_id" }, // Collect all distinct years
            sections: { $push: { year: "$_id", sections: "$sections" } }, // Sections grouped by year
          },
        },
        {
          $project: {
            _id: 0,
            years: 1,
            sections: 1,
          },
        },
      ]);

      let response = await employeeSubjectMapQueries.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: { data: result, mappings: response },
      });
    } catch (error) {
      throw error;
    }
  }

  static async upcomingLectures(req) {
    try {
      const currentDay = moment().format("dddd");
      const currentSemester = await semesterQuery.findOne({ active: true });
      const labBatches = await labBatchQuery.findAll({
        semester: currentSemester._id,
        faculty: req.employee,
      });

      const timeTable = await timeTableQuery.findAll({
        $or: [
          {
            semester: currentSemester._id,
            day: currentDay,
            faculty: req.employee,
          },
          {
            semester: currentSemester._id,
            day: currentDay,
            batches: { $in: labBatches.map((b) => b._id) },
          },
        ],
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: timeTable,
      });
    } catch (error) {
      throw error;
    }
  }
};
