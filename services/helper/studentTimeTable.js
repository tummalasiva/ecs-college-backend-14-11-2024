const timeTableQuery = require("@db/studentTimeTable/queries");
const StudentTimeTable = require("@db/studentTimeTable/model");
const degreeCodeQueries = require("@db/degreeCode/queries");
const studentQueries = require("@db/student/queries");
const academicYearQueries = require("@db/academicYear/queries");
const subjectQueries = require("@db/subject/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { notFoundError } = require("../../helper/helpers");

module.exports = class StudentTimeTableService {
  static async create(req) {
    try {
      // timeTableData = { slots = [], buidling, room, faculty, title, subject, batches =[] }
      const { day, semester, degreeCode, section, year, timeTableData } =
        req.body;
      if (!Array.isArray(timeTableData))
        return common.failureResponse({
          message: "Invalid timeTableData",
          responseCode: "CLIENT_ERROR",
          statusCode: httpStatusCode.bad_request,
        });

      let currentAcademicYear = await academicYearQueries.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return common.failureResponse({
          message: "No active academic year found",
          responseCode: "CLIENT_ERROR",
          statusCode: httpStatusCode.bad_request,
        });

      for (let time of timeTableData) {
        let timeTableExists = await timeTableQuery.findOne({
          $or: [
            {
              academicYear: currentAcademicYear._id,
              semester,
              day,
              slots: { $in: time.slots },
              building: time.building,
              room: time.room,
            },
            {
              day,
              slots: { $in: time.slots },
              faculty: time.faculty,
            },
          ],
        });

        if (timeTableExists)
          return common.failureResponse({
            message:
              "Time table for given combination already exists" +
              JSON.stringify(time),
            responseCode: "CLIENT_ERROR",
            statusCode: httpStatusCode.bad_request,
          });
      }

      let docsToInsert = [];
      for (let time of timeTableData) {
        docsToInsert.push({
          academicYear: currentAcademicYear._id,
          semester,
          degreeCode,
          year,
          day,
          slots: time.slots,
          building: time.building,
          room: time.room,
          faculty: time.faculty,
          title: time.title,
          subject: time.subject,
          batches: time.batches,
          section,
        });
      }

      const newTimeTableList = await StudentTimeTable.insertMany(docsToInsert);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Time table created successfully",
        result: newTimeTableList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await timeTableQuery.findAll({
        ...search,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: list,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getStudentTimeTable(req) {
    try {
      const { degreeCode, semester, year, section, academicYear } = req.query;
      let currentAcademicYear = await academicYearQueries.findOne({
        active: true,
      });
      let filter = {
        degreeCode,
        semester,
        year,
        section,
        academicYear: academicYear || currentAcademicYear._id,
      };
      const timeTable = await timeTableQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: timeTable,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getEmployeeTimeTable(req) {
    try {
      const { year, semester, academicYear, employee } = req.query;
      let currentAcademicYear = await academicYearQueries.findOne({
        active: true,
      });

      let academicYearToAccount = academicYear || currentAcademicYear._id;

      const timeTable = await timeTableQuery.findAll({
        year,
        semester,
        academicYear: academicYearToAccount,
      });

      let requiredTimeTable = timeTable.filter(
        (t) =>
          t.faculty?._id?.toHexString() === employee ||
          t.batches.find((b) => b.faculty?._id?.toHexString() === employee)
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: requiredTimeTable,
      });
    } catch (error) {
      throw error;
    }
  }
};
