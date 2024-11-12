const timeTableQuery = require("@db/studentTimeTable/queries");
const CoursePlan = require("@db/coursePlan/model");
const semesterQuery = require("@db/semester/queries");
const employeeSubjectsMapping = require("@db/employeeSubjectsMapping/queries");
const labBatchQuery = require("@db/labBatch/queries");
const StudentTimeTable = require("@db/studentTimeTable/model");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const slotQuery = require("@db/slot/queries");
const StudentAttendance = require("@db/attendance/studentAttendance/model");
const studentQuery = require("@db/student/queries");
const subjectQuery = require("@db/subject/queries");
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
        // case 1 === No room can be booked in the same slot on the same day
        let case1Filter = {
          day,
          slots: { $in: time.slots },
          room: time.room,
        };

        // case 2 === Any student in given section cannot have aonther subject in the same slot in another room
        let studentsOfGivenSection = [];
        if (time.batches?.length) {
          let allBatches = await labBatchQuery.findAll({ $in: time.batches });
        }

        let case2Filter = {};

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
            message: "Time table for given combination already exists",
            responseCode: "CLIENT_ERROR",
            statusCode: httpStatusCode.bad_request,
          });
      }

      let docsToInsert = [];
      let coursePlanToInsert = [];
      let studentAttendanceToInsert = [];
      for (let time of timeTableData) {
        let timeTableId = new mongoose.Types.ObjectId();
        let newItem = {
          _id: timeTableId,
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
          faculties: [],
        };

        let requestedSubject = await subjectQuery.findOne({
          _id: time.subject,
        });

        let students = await studentQuery.findAll({
          "academicInfo.semester": semester._id,
          "academicInfo.year": year,
          "academicInfo.degreeCode": degreeCode,
          "academicInfo.section": { $in: [section] },
          registerdSubjects: { $in: [time.subject] },
        });

        let employeeSubjectMap = await employeeSubjectsMapping.findOne({
          semester: semester._id,
          year: parseInt(year),
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

        if (time.batches?.length) {
          let labBatches = await labBatchQuery.findAll({
            _id: { $in: time.batches },
          });

          if (labBatches.length !== time.batches?.length)
            return common.failureResponse({
              message:
                "One or more lab batches were not found for this subject and section!",
              responseCode: "CLIENT_ERROR",
              statusCode: httpStatusCode.bad_request,
            });

          for (let date of datesInThisSemester) {
            let data = {
              subject: time.subject,
              section: section,
              plannedDate: date,
              facultyAssigned: employeeSubjectMap.employee?._id,
              slots: time.slots,
              day: day,
              semester: semester._id,
              year: year,
              building: time.building,
              room: time.room,
              courseType: "lab",
            };
            coursePlanToInsert.push(data);
          }

          for (let batch of labBatches) {
            newItem.faculties.push(batch.faculty._id);
            for (let student of batch.students) {
              for (let date of datesInThisSemester) {
                let attendanceData = {
                  attendanceType: "lab",
                  labBatch: batch._id,
                  school: req.schoolId,
                  degreeCode: degreeCode,
                  year: year,
                  semester: semester._id,
                  section: section,
                  student: student._id,
                  subject: time.subject,
                  slots: time.slots,
                  date,
                  attendanceStatus: null,
                  timeTableId,
                };
                studentAttendanceToInsert.push(attendanceData);
              }
            }
          }
        } else {
          newItem.faculties.push(employeeSubjectMap.employee._id);

          for (let date of datesInThisSemester) {
            let data = {
              subject: time.subject,
              section: section,
              plannedDate: date,
              facultyAssigned: employeeSubjectMap.employee?._id,
              slots: time.slots,
              day: day,
              semester: semester._id,
              year: year,
              building: time.building,
              room: time.room,
              courseType: "theory",
            };
            coursePlanToInsert.push(data);
          }

          for (let student of students) {
            for (let date of datesInThisSemester) {
              let attendanceData = {
                attendanceType: "theory",
                school: req.schoolId,
                degreeCode: degreeCode,
                year: year,
                semester: semester._id,
                section: section,
                student: student._id,
                subject: time.subject,
                date,
                attendanceStatus: null,
                timeTableId,
              };
              studentAttendanceToInsert.push(attendanceData);
            }
          }
        }

        docsToInsert.push(newItem);
      }

      const newTimeTableList = await StudentTimeTable.insertMany(docsToInsert);
      await CoursePlan.insertMany(coursePlanToInsert);

      await StudentAttendance.insertMany(studentAttendanceToInsert);
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
      if (!semester) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      let employeeSubjectMap = await employeeSubjectsMapping.findAll({
        employee: employeeId,
        semester: semester._id,
      });

      let data =
        employeeSubjectMap.flatMap((m) =>
          m.subjects.map((s) => ({
            subject: s.subject._id,
            section: s.section._id,
          }))
        ) || [];

      let labBatches = await labBatchQuery.findAll({
        semester: semester._id,
        faculty: employeeId,
      });

      for (let batch of labBatches) {
        data.push({ subject: batch.subject?._id, section: batch.section._id });
      }

      console.log(data, "data");

      const groupedTimeTable = await StudentTimeTable.aggregate([
        {
          $match: {
            faculties: { $in: [mongoose.Types.ObjectId(employeeId)] },
            semester: semester._id,
          },
        },
        {
          // Perform the lookups before grouping
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
          $group: {
            _id: "$day",
            // Use $addToSet to ensure unique combinations based on fields
            timetableEntries: {
              $addToSet: {
                slot: "$slot",
                subject: "$subject",
                section: "$section",
                building: "$building",
                room: "$room",
                courseType: "$attendanceType",
              },
            },
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
};
