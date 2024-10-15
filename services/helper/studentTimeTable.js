const timeTableQuery = require("@db/studentTimeTable/queries");
const CoursePlan = require("@db/coursePlan/model");
const semesterQuery = require("@db/semester/queries");
const employeeSubjectsMapping = require("@db/employeeSubjectsMapping/queries");
const labBatchQuery = require("@db/labBatch/queries");
const StudentTimeTable = require("@db/studentTimeTable/model");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const slotQuery = require("@db/slot/queries");
const {
  notFoundError,
  getDatesForSpecificDay,
} = require("../../helper/helpers");
const { default: mongoose } = require("mongoose");

module.exports = class StudentTimeTableService {
  static async create(req) {
    try {
      // timeTableData = { slots = [], buidling, room, faculty, title, subject, batches =[] }
      const { day, degreeCode, section, year, timeTableData } = req.body;
      if (!Array.isArray(timeTableData))
        return common.failureResponse({
          message: "Invalid timeTableData",
          responseCode: "CLIENT_ERROR",
          statusCode: httpStatusCode.bad_request,
        });

      const semester = await semesterQuery.findOne({ active: true });
      if (!semester)
        return common.failureResponse({
          message: "No active semester found!",
          responseCode: "CLIENT_ERROR",
          statusCode: httpStatusCode.bad_request,
        });

      for (let time of timeTableData) {
        let timeTableExists = await timeTableQuery.findOne({
          $or: [
            {
              semester: semester._id,
              day,
              slots: { $in: time.slots },
              building: time.building,
              room: time.room,
            },
            {
              day,
              slots: { $in: time.slots },
              subject: time.subject,
              section: section,
            },

            {
              day,
              subject: time.subject,
              section: section,
            },
            {
              day,
              slots: { $in: time.slots },
              section: section,
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
      let coursePlanToInsert = [];
      for (let time of timeTableData) {
        docsToInsert.push({
          semester: semester._id,
          degreeCode,
          year,
          day,
          slots: time.slots,
          building: time.building,
          room: time.room,
          title: time.title,
          subject: time.subject,
          batches: time.batches,
          section,
        });

        let employeeSubjectMap = await employeeSubjectsMapping.findOne({
          semester: semester._id,
          year: year,
          subjects: { $elemMatch: { subject: time.subject, section: section } },
        });

        if (!employeeSubjectMap)
          return common.failureResponse({
            message:
              "No faculty have been assigned to this subject and section for this semester!",
            responseCode: "CLIENT_ERROR",
            statusCode: httpStatusCode.bad_request,
          });

        let startData = semester.from;
        let endDate = semester.to;
        let datesInThisSemester = getDatesForSpecificDay(
          startData,
          endDate,
          day
        );

        let facultyAssigned = employeeSubjectMap.employee?._id;

        if (time.batches?.length) {
          let labBatch = await labBatchQuery.findOne({
            subject: time.subject,
            section: section,
          });
          if (!labBatch)
            return common.failureResponse({
              message: "No lab batch found for this subject and section!",
              responseCode: "CLIENT_ERROR",
              statusCode: httpStatusCode.bad_request,
            });

          facultyAssigned = labBatch.faculty?._id;
        }
        for (let date of datesInThisSemester) {
          let data = {
            subject: time.subject,
            section: section,
            plannedDate: date,
            facultyAssigned: facultyAssigned,
            slots: time.slots,
            day: day,
            semester: semester._id,
            year: year,
            building: time.building,
            room: time.room,
          };
          coursePlanToInsert.push(data);
        }
      }

      const newTimeTableList = await StudentTimeTable.insertMany(docsToInsert);
      await CoursePlan.insertMany(coursePlanToInsert);
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
      const { degreeCode, year, section } = req.query;

      const semester = await semesterQuery.findOne({ active: true });
      if (!semester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      const filter = {
        year: parseInt(year),
        degreeCode: mongoose.Types.ObjectId(degreeCode),
        semester: semester._id,
      };

      if (Array.isArray(section)) {
        filter.section = {
          $in: section.map((s) => mongoose.Types.ObjectId(s)),
        };
      } else {
        filter.section = mongoose.Types.ObjectId(section);
      }

      const groupedTimeTable = await StudentTimeTable.aggregate([
        {
          $match: filter,
        },
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subject",
          },
        },
        {
          $unwind: "$subject",
        },
        {
          $lookup: {
            from: "slots",
            localField: "slots",
            foreignField: "_id",
            as: "slot",
          },
        },
        {
          $unwind: "$slot",
        },
        {
          $lookup: {
            from: "buildingrooms",
            localField: "room",
            foreignField: "_id",
            as: "room",
          },
        },
        {
          $unwind: "$room",
        },

        {
          $lookup: {
            from: "buildings",
            localField: "building",
            foreignField: "_id",
            as: "building",
          },
        },
        {
          $unwind: "$building",
        },

        {
          $lookup: {
            from: "sections",
            localField: "section",
            foreignField: "_id",
            as: "section",
          },
        },
        {
          $unwind: "$section",
        },
        {
          $group: {
            _id: "$day",
            timetableEntries: { $push: "$$ROOT" },
          },
        },

        {
          $sort: { _id: 1 },
        },
      ]);

      const allSlots = await slotQuery.findAll({ type: "Class" });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: { timetable: groupedTimeTable, slots: allSlots },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getEmployeeTimeTable(req) {
    try {
      const { employeeId } = req.query;

      const semester = await semesterQuery.findOne({ active: true });
      if (!semester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      const groupedTimeTable = await CoursePlan.aggregate([
        {
          $match: {
            facultyAssigned: mongoose.Types.ObjectId(employeeId),
            semester: semester._id,
          },
        },
        {
          $group: {
            _id: "$day",
            timetableEntries: { $push: "$$ROOT" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: groupedTimeTable,
      });
    } catch (error) {
      throw error;
    }
  }
};
