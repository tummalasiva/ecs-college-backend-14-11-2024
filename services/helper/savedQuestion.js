const savedQuestionQuery = require("@db/savedQuestion/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class SavedQuestionHelper {
  static async create(req) {
    try {
      let file = "";
      if (req.files && req.files.image) {
        file = await uploadFileToS3(req.files.image);
      }
      let savedQuestion = await savedQuestionQuery.create({
        ...req.body,
        createdBy: req.employee,
        image: file,
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
      let savedQuestion = await savedQuestionQuery.findOne({
        _id: req.params.id,
      });
      if (!savedQuestion)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Saved Question not found",
          responseCode: "CLIENT_ERROR",
        });

      let file = savedQuestion.image;

      if (req.files && req.files.image) {
        if (file) await deleteFile(file);
        file = await uploadFileToS3(req.files.image);
      }
      const updatedSavedQuestion = await savedQuestionQuery.updateOne(
        { _id: req.params.id },
        { $set: { ...req.body, image: file } },
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
      await savedQuestionQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Saved Question deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
