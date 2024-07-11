const guardianFeedbackQuery = require("@db/guardianFeedback/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class GuardianFeedbackService {
  static async create(body) {
    try {
      const newFeedback = await guardianFeedbackQuery.create(body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Thanks for your valuable feedback!",
        result: newFeedback,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }
      let feedbacks = await guardianFeedbackQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: feedbacks,
      });
    } catch (error) {
      throw error;
    }
  }

  static async listPublic(req) {
    try {
      const { search = {}, schoolId } = req.query;
      let filter = { ...search };
      if (schoolId) {
        filter["school"] = schoolId;
      }
      filter["status"] = "approved";
      let feedbacks = await guardianFeedbackQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: feedbacks,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body) {
    try {
      delete body.feedback;
      delete body.school;
      delete body.parentName;
      delete body.studentName;

      const newFeedback = await guardianFeedbackQuery.updateOne(
        { _id: id },
        body,
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Feedback updated successfully",
        result: newFeedback,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let feedbacks = await guardianFeedbackQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Feedback deleted successfully!",
        result: feedbacks,
      });
    } catch (error) {
      throw error;
    }
  }
};
