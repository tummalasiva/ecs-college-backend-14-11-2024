const examScheduleQuery = require("@db/examSchedule/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const academicYearQuery = require("@db/academicYear/queries");
const subjectQuery = require("@db/subject/queries");
const studentQuery = require("@db/student/queries");
const degreeCodeQuery = require("@db/degreeCode/queries");
const examTitleQuery = require("@db/examTitle/queries");
const slotQuery = require("@db/slot/queries");
const sectionQuery = require("@db/section/queries");
const semesterQuery = require("@db/semester/model");
const coursePlanQuery = require("@db/coursePlan/queries");
const cieExamQuery = require("@db/cieExam/queries");
const labBatchQuery = require("@db/labBatch/queries");

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const {
  compileTemplate,
  notFoundError,
  stripTimeFromDate,
  getDateRange,
} = require("../../helper/helpers");
const { default: mongoose } = require("mongoose");

module.exports = class ExamScheduleService {
  static async create(req) {
    try {
      const { slot, date, cieExamId } = req.body;

      const cieExamData = await cieExamQuery.findOne({ _id: cieExamId });
      if (!cieExamData) return notFoundError("CIE exam not found!");

      const {
        subject: subjectData,
        section: sectionData,
        courseType,
        year,
        questions,
        examTitle,
        semester,
      } = cieExamData;

      const [slotData, examTitleData] = await Promise.all([
        slotQuery.findOne({ _id: slot }),
        examTitleQuery.findOne({ _id: examTitle }),
      ]);

      if (!slotData) return notFoundError("Slot not found!");
      if (!examTitleData) return notFoundError("Exam title not found!");

      // Set up student filter
      let filter = {
        "academicInfo.section": sectionData._id,
        registeredSubject: subjectData._id,
        "academicInfo.semester": semester._id,
        "academicInfo.year": year,
        active: true,
      };

      // Handle lab course type
      if (courseType === "lab") {
        const labBatch = await labBatchQuery.findOne({
          semester: semester._id,
          subject: subjectData._id,
          section: sectionData._id,
          year,
          faculty: cieExamData.createdBy?._id,
        });

        if (!labBatch) {
          return common.failureResponse({
            statusCode: httpStatusCode.badRequest,
            message: "Lab batch not found!",
          });
        }

        filter = { _id: { $in: labBatch.students.map((s) => s._id) } };
      }

      let students = await studentQuery.findAll(filter);

      const studentIds = students.map((s) => s._id);

      let [sameSubjectScheduled, examSheduleForSameStudent] = await Promise.all(
        [
          examScheduleQuery.findOne({
            cieExam: cieExamData._id,
            semester: semester._id,
          }),
          examScheduleQuery.findOne({
            semester: semester._id,
            student: { $in: studentIds },
            slot: slotData._id,
            $expr: {
              $eq: [
                { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: stripTimeFromDate(date),
                  },
                },
              ],
            },
          }),
        ]
      );

      if (sameSubjectScheduled)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Cannot create exam schedule for same subject in the same semester!",
          responseCode: "CLIENT_ERROR",
        });

      if (examSheduleForSameStudent)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Cannot create exam schedule for same students in the same semester in the same slot on the same day!",
          responseCode: "CLIENT_ERROR",
        });

      let examScheduleExistsInAnotherSlot = await examScheduleQuery.findOne({
        examTitle,
        cieExam: cieExamData._id,
        year,
        date: stripTimeFromDate(date),
      });

      if (examScheduleExistsInAnotherSlot) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Exam schedule already exists!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const examSchedule = await examScheduleQuery.create({
        students: studentIds,
        createdBy: req.employee,
        semester: semester._id,
        examTitle: examTitle,
        cieExam: cieExamData._id,
        date,
        slot,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam schedule created successfully!",
        result: examSchedule,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };

      if (filter.date) {
        filter["$expr"] = {
          $eq: [
            { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            {
              $dateToString: {
                format: "%Y-%m-%d",
                date: new Date(filter.date),
              },
            },
          ],
        };

        delete filter.date;
      }

      if (filter.fromDate && filter.toDate) {
        const { startOfDay, endOfDay } = getDateRange(
          filter.fromDate,
          filter.toDate
        );

        filter["date"] = { $gt: startOfDay, $lte: endOfDay };

        delete filter.fromDate;
        delete filter.toDate;
      }

      delete filter.subject;

      let scheduleList = await examScheduleQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: scheduleList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { slot, date, cieExamId } = req.body;

      const cieExamData = await cieExamQuery.findOne({ _id: cieExamId });
      if (!cieExamData) return notFoundError("CIE exam not found!");

      const {
        subject: subjectData,
        section: sectionData,
        courseType,
        year,
        questions,
        examTitle,
        semester,
      } = cieExamData;

      const [slotData, examTitleData] = await Promise.all([
        slotQuery.findOne({ _id: slot }),
        examTitleQuery.findOne({ _id: examTitle }),
      ]);

      if (!slotData) return notFoundError("Slot not found!");
      if (!examTitleData) return notFoundError("Exam title not found!");

      // Set up student filter
      let filter = {
        "academicInfo.section": sectionData._id,
        registeredSubject: subjectData._id,
        "academicInfo.semester": semester._id,
        "academicInfo.year": year,
        active: true,
      };

      // Handle lab course type
      if (courseType === "lab") {
        const labBatch = await labBatchQuery.findOne({
          semester: semester._id,
          subject: subjectData._id,
          section: sectionData._id,
          year,
          faculty: cieExamData.createdBy?._id,
        });

        if (!labBatch) {
          return common.failureResponse({
            statusCode: httpStatusCode.badRequest,
            message: "Lab batch not found!",
          });
        }

        filter = { _id: { $in: labBatch.students.map((s) => s._id) } };
      }

      let students = await studentQuery.findAll(filter);

      const studentIds = students.map((s) => s._id);

      let [sameSubjectScheduled, examSheduleForSameStudent] = await Promise.all(
        [
          examScheduleQuery.findOne({
            cieExam: cieExamData._id,
            semester: semester._id,
            _id: { $ne: req.params.id },
          }),
          examScheduleQuery.findOne({
            semester: semester._id,
            student: { $in: studentIds },
            slot: slotData._id,
            _id: { $ne: req.params.id },
            $expr: {
              $eq: [
                { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: stripTimeFromDate(date),
                  },
                },
              ],
            },
          }),
        ]
      );

      if (sameSubjectScheduled)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Cannot update exam schedule for same subject in the same semester!",
          responseCode: "CLIENT_ERROR",
        });

      if (examSheduleForSameStudent)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Cannot update exam schedule for same students in the same semester in the same slot on the same day!",
          responseCode: "CLIENT_ERROR",
        });

      let examScheduleExistsInAnotherSlot = await examScheduleQuery.findOne({
        examTitle,
        cieExam: cieExamData._id,
        year,
        date: stripTimeFromDate(date),
        _id: { $ne: req.params.id },
      });

      if (examScheduleExistsInAnotherSlot) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Exam schedule already exists!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const examSchedule = await examScheduleQuery.updateOne(
        { _id: req.params.id },
        {
          students: studentIds,
          createdBy: req.employee,
          semester: semester._id,
          examTitle: examTitle,
          cieExam: cieExamData._id,
          date,
          slot,
        }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam schedule updated successfully!",
        result: examSchedule,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      let examSchedule = await examScheduleQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam schedule deleted successfully!",
        result: examSchedule,
      });
    } catch (error) {
      throw error;
    }
  }

  static async generateHallTicket(req) {}
};
