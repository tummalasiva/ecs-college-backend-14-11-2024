const courseOutcomeQuery = require("@db/courseOutcome/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class CourseOutcomeService {
  static async create(req) {
    try {
      const { coId, description, degreeCode, subject } = req.body;
      const courseOutcomeExist = await courseOutcomeQuery.findOne({
        coId: { $regex: new RegExp(`^${coId}^`, "i") },
        degreeCode,
        subject,
      });
      if (courseOutcomeExist)
        return common.failureResponse({
          message:
            "Course outcome with given PO ID and Degree Code already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const newCourseOutcome = await courseOutcomeQuery.create(req.body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course Outcome added successfully!",
        result: newCourseOutcome,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await courseOutcomeQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: list,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { coId, description, degreeCode, subject } = req.body;
      const courseOutcomeExist = await courseOutcomeQuery.findOne({
        coId: { $regex: new RegExp(`^${coId}^`, "i") },
        degreeCode,
        subject,
        _id: { $ne: req.params.id },
      });

      if (courseOutcomeExist)
        return common.failureResponse({
          message:
            "Course Outcome with given CO ID, Subject and Degree Code already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const updatedCourseOutcome = await courseOutcomeQuery.updateOne(
        { _id: req.params.id },
        req.body
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course outcome updated successfully!",
        result: updatedCourseOutcome,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const deletedCoOutcome = await courseOutcomeQuery.delete({
        _id: req.params.id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course Outcome deleted successfully!",
        result: deletedCoOutcome,
      });
    } catch (error) {
      throw error;
    }
  }
};
