const guardianFeedbackQuery = require("@db/guardianFeedback/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class GuardianFeedbackService {
  static async create(req) {
    try {
      let data = {
        ...req.body,
        guardian: req.parent?._id,
      };
      const newFeedback = await guardianFeedbackQuery.create(data);
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
      const { search = {} } = req.query;
      let filter = { ...search };
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
