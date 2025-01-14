const internalExamQuery = require("@db/internalExam/queries");
const internalExamScheduleQuery = require("@db/internalExamSchedule/queries");
const studentQuery = require("@db/assessmentPlan/queries");
const semesterQuery = require("@db/semester/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { stripTimeFromDate } = require("../../helper/helpers");
const employeeQuery = require("@db/employee/queries");

module.exports = class InternalExamScheduleService {
  static async create(req) {
    try {
      const { exam, slot, date, building, room } = req.body;

      let currentEmployee = await employeeQuery.findOne({ _id: req.employee });

      // exam schdule cannot be created

      // happy path

      let activeSemester = await semesterQuery.findOne({ status: "active" });
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
        room,
        semester: activeSemester._id,
        createdBy: req.employee,
        creatorUserType: currentEmployee.userType,
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

  static async toggleStatus(req) {
    try {
      const updatedDoc = await internalExamScheduleQuery.updateOne(
        { _id: req.params.id },
        [{ $set: { enabled: { $eq: ["$enabled", false] } } }]
      );
      if (!updatedDoc)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Exam Schedule not found!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `Exam Schedule ${
          updatedDoc.enabled ? "enabled" : "disabled"
        } successfully!`,
        responseCode: "SUCCESS",
        result: updatedDoc,
      });
    } catch (error) {
      throw error;
    }
  }
};
