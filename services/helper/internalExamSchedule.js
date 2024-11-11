const internalExamQuery = require("@db/internalExam/queries");
const internalExamScheduleQuery = require("@db/internalExamSchedule/queries");
const studentQuery = require("@db/assessmentPlan/queries");
const semesterQuery = require("@db/semester/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { stripTimeFromDate } = require("../../helper/helpers");

module.exports = class InternalExamScheduleService {
  static async create(req) {
    try {
      const { exam, slot, date, building, buildingRoom } = req.body;

      // exam schdule cannot be created

      // happy path

      let activeSemester = await semesterQuery.findOne({ active: true });
      if (!activeSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active semester found!",
          responseCode: "CLIENT_ERROR",
        });

      let newSchedule = await internalExamScheduleQuery.create({
        exam,
        slot,
        date: stripTimeFromDate(new Date(date)),
        building,
        buildingRoom,
        createdBy: req.employee,
      });

      return common.successResponse({
        statusCode: httpStatusCode.created,
        message: "Exam Schedule created successfully!",
        responseCode: "SUCCESS",
        result: newSchedule,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };

      let schedules = await internalExamScheduleQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam Schedule list fetched successfully!",
        responseCode: "SUCCESS",
        result: schedules,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const { id } = req.params;
      const deletedSchedule = await internalExamScheduleQuery.delete({
        _id: id,
      });

      if (!deletedSchedule)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Exam Schedule not found!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam Schedule deleted successfully!",
        responseCode: "SUCCESS",
      });
    } catch (error) {
      throw error;
    }
  }
};
