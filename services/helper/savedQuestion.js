const savedQuestionQuery = require("@db/savedQuestion/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class SavedQuestionHelper {
  static async create(req) {
    try {
      const savedQuestion = await savedQuestionQuery.create({
        ...req.body,
        createdBy: req.employee,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Saved Question created successfully",
        result: savedQuestion,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await savedQuestionQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Saved Question fetched successfully",
        result: list,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const updatedSavedQuestion = await savedQuestionQuery.updateOne(
        { _id: req.params.id },
        { $set: { ...req.body } },
        { new: true }
      );
      if (!updatedSavedQuestion)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Saved Question not found",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Saved Question updated successfully",
        result: updatedSavedQuestion,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await savedQuestionQuery.deleteOne({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Saved Question deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
