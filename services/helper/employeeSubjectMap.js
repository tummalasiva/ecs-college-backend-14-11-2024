const employeeSubjectMapQueries = require("@db/employeeSubjectsMapping/queries");
const degreeCodeQueries = require("@db/degreeCode/queries");
const employeeQueries = require("@db/employee/queries");
const academicYearQueries = require("@db/academicYear/queries");
const subjectQueries = require("@db/subject/queries");
const semesterQuery = require("@db/semester/queries");
const timeTableQuery = require("@db/studentTimeTable/queries");
const labBatchQuery = require("@db/labBatch/queries");
const studentQuery = require("@db/student/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const moment = require("moment");
const { notFoundError, getOrdinalSuffix } = require("../../helper/helpers");
const EmployeeSubjectMapping = require("@db/employeeSubjectsMapping/model");
const { default: mongoose } = require("mongoose");
const { request } = require("express");

module.exports = class EmployeeSubjectsMappingHelper {
  static async assignSubjects(req) {
    try {
      const { degreeCodeId, employeeId, subjectData, year } = req.body;
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

      let semester = await semesterQuery.findOne({
        active: true,
        academicYear: currentAcademicYear._id,
      });

      if (!semester) return notFoundError("Semester not found");

      for (let subData of subjectData) {
        let employeeMapExists = await employeeSubjectMapQueries.findOne({
          $or: [
            {
              degreeCode: degreeCodeData._id,
              employee: employeeData._id,
              academicYear: currentAcademicYear._id,
              semester: semester._id,
              year,
              subjects: {
                $elemMatch: {
                  subject: subData.subject,
                  section: subData.section,
                },
              },
            },
            {
              degreeCode: degreeCodeData._id,
              academicYear: currentAcademicYear._id,
              semester: semester._id,
              year,
              subjects: {
                $elemMatch: {
                  subject: subData.subject,
                  section: subData.section,
                },
              },
            },
          ],
        });

        if (employeeMapExists)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message:
              "Subject in this section already assigned for this employee or some other employee!",
            responseCode: "CLIENT_ERROR",
          });
      }

      let updatedMap = await employeeSubjectMapQueries.updateOne(
        {
          degreeCode: degreeCodeData._id,
          employee: employeeData._id,
          academicYear: currentAcademicYear._id,
          semester: semester._id,
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
      const { mapId, subjectId, sectionId } = req.body;

      let updatedEmployeesSubjects = await employeeSubjectMapQueries.updateOne(
        {
          _id: mapId,
        },
        {
          $pull: {
            subjects: {
              subject: subjectId,
              section: sectionId,
            },
          },
        },
        {
          new: true,
        }
      );

      if (!updatedEmployeesSubjects)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Employee Subject Mapping not found!",
          responseCode: "CLIENT_ERROR",
        });

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
      // Retrieve the current active academic year
      let currentAcademicYear = await academicYearQueries.findOne({
        active: true,
      });

      // Find the active semester within the current academic year
      let activeSemester = await semesterQuery.findOne({
        academicYear: currentAcademicYear._id,
        active: true,
      });

      // Check if an active semester is found
      if (!activeSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Active semester not found",
          responseCode: "CLIENT_ERROR",
        });

      // Define the filter to match the EmployeeSubjectMapping
      let acadYear = currentAcademicYear._id;
      let filter = {
        academicYear: acadYear,
        employee: mongoose.Types.ObjectId(req.employee),
        semester: activeSemester._id,
      };

      // Aggregation pipeline to group subjects by degreeCode, year, and section
      const result = await EmployeeSubjectMapping.aggregate([
        { $match: filter }, // Filter based on the employee, academic year, and semester
        { $unwind: "$subjects" }, // Unwind subjects to handle each separately

        // Lookup for subjects details
        {
          $lookup: {
            from: "subjects",
            localField: "subjects.subject",
            foreignField: "_id",
            as: "subjectDetails",
          },
        },
        { $unwind: "$subjectDetails" }, // Unwind subject details

        // Lookup for section details
        {
          $lookup: {
            from: "sections",
            localField: "subjects.section",
            foreignField: "_id",
            as: "sectionDetails",
          },
        },
        { $unwind: "$sectionDetails" }, // Unwind section details

        // Lookup for degreeCode details
        {
          $lookup: {
            from: "degreecodes", // Assuming this is the collection name for degree codes
            localField: "degreeCode",
            foreignField: "_id",
            as: "degreeCodeDetails",
          },
        },
        { $unwind: "$degreeCodeDetails" }, // Unwind degreeCode details

        // Group subjects under each section
        {
          $group: {
            _id: {
              section: "$subjects.section",
              year: "$year",
              degreeCode: "$degreeCode",
            },
            sectionDetails: { $first: "$sectionDetails" },
            subjects: {
              $push: "$subjectDetails", // Group all subjects under each section
            },
            degreeCodeDetails: { $first: "$degreeCodeDetails" }, // Capture degreeCode details
          },
        },

        // Group by year and degreeCode
        {
          $group: {
            _id: {
              year: "$_id.year",
              degreeCode: "$_id.degreeCode",
            },
            sections: {
              $push: {
                section: "$sectionDetails", // Keep section details
                subjects: "$subjects", // Keep grouped subjects for each section
              },
            },
            degreeCodeDetails: { $first: "$degreeCodeDetails" }, // Capture degreeCode details
          },
        },

        // Group by degreeCode
        {
          $group: {
            _id: "$_id.degreeCode",
            years: {
              $push: {
                year: "$_id.year",
                sections: "$sections", // List of sections for each year
              },
            },
            degreeCodeDetails: { $first: "$degreeCodeDetails" }, // Capture degreeCode details
          },
        },

        // Final projection of results
        {
          $project: {
            _id: 0,
            degreeCode: "$_id", // Return degreeCode
            years: 1, // Return grouped years and sections
            degreeCodeDetails: 1, // Include degreeCode details
          },
        },
      ]);

      // Querying the mappings
      let response = await employeeSubjectMapQueries.findAll(filter);

      // Success response
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
      const currentSemester = await semesterQuery.findOne({ status: "active" });
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

  static async getMyCourses(req) {
    try {
      let currentSemester = await semesterQuery.findOne({ status: "active" });
      if (!currentSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Active semester not found",
          responseCode: "CLIENT_ERROR",
        });

      let employeeSubjectMappingExists =
        await employeeSubjectMapQueries.findAll({
          employee: req.employee,
          semester: currentSemester._id,
        });
      let data = [];
      if (employeeSubjectMappingExists.length > 0) {
        for (let i = 0; i < employeeSubjectMappingExists.length; i++) {
          let subjects = employeeSubjectMappingExists[i].subjects;
          for (let j = 0; j < subjects.length; j++) {
            let subject = subjects[j];
            data.push({
              id: `${subject.subject?._id}-${subject.section?._id}-${employeeSubjectMappingExists[i].year}-${currentSemester._id}-Theory`,
              label: `[${getOrdinalSuffix(
                parseInt(employeeSubjectMappingExists[i].year)
              )}]-${subject.subject.name} (${
                subject.subject.subjectCode
              })-[Section ${subject.section?.name}]--Theory`,
              subject: subject.subject,
              section: subject.section,
              year: employeeSubjectMappingExists[i].year,
              semester: currentSemester,
              degreeCode: employeeSubjectMappingExists[i].degreeCode,
              courseType: "Theory",
            });
          }
        }
      }

      const labBatches = await labBatchQuery.findAll({
        semester: currentSemester._id,
        faculty: req.employee,
      });
      if (labBatches.length > 0) {
        for (let batch of labBatches) {
          data.push({
            id: `${batch.subject?._id}-${batch.section?._id}-${batch.year}-${currentSemester._id}-Lab`,
            label: `[${getOrdinalSuffix(parseInt(batch.year))}]-${
              batch.subject.name
            } (${batch.subject.subjectCode})-[Section ${
              batch.section?.name
            }]--Lab`,
            subject: batch.subject,
            section: batch.section,
            year: batch.year,
            semester: currentSemester,
            degreeCode: batch.degreeCode,
            courseType: "Lab",
          });
        }
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: data,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getStudents(req) {
    try {
      const { details } = req.query;
      if (typeof details !== "string")
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid query parameters",
          responseCode: "CLIENT_ERROR",
        });

      let detailsArray = details.split("-");

      let subject = detailsArray[0];
      let section = detailsArray[1];
      let year = parseInt(detailsArray[2]);
      let semester = detailsArray[3];
      let courseType = detailsArray[4];

      if (courseType === "Theory") {
        let students = await studentQuery.findAll({
          "academicInfo.section": { $in: [section] },
          "academicInfo.year": year,
          "academicInfo.semester": semester,
          registeredSubjects: { $in: [subject] },
          active: true,
        });

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          result: students,
        });
      } else if (courseType === "Lab") {
        let labBatch = await labBatchQuery.findOne({
          semester: semester,
          year: year,
          section: section,
          faculty: req.employee,
        });

        let students = await studentQuery.findAll({
          _id: { $in: labBatch?.students.map((s) => s._id) },
        });

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          result: students,
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
