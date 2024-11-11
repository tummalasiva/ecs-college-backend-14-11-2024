const myQuestionBankQuery = require("@db/myQuestionBank/queries");
const MyQuestionBank = require("@db/myQuestionBank/model");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const geminiModel = require("../../configs/geminiModel");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class MyQuestionBankHelper {
  static async create(req) {
    try {
      const {
        subject,
        question,
        isMcq,
        options,
        answer,
        maximumMarks,
        minimumMarksForCoAttainment,
        cos,
        bl,
      } = req.body;

      if (isMcq && !Array.isArray(options.split(",")))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Options should be an array if isMcq is true!",
          responseCode: "CLIENT_ERROR",
        });

      if (isMcq && !options.split(",").length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Options should not be empty if isMcq is true!",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(cos.split(",")))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Cos should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let data = {
        subject,
        question,
        isMcq,
        options: isMcq ? options.split(",") : [],
        cos: cos.split(","),
        answer,
        maximumMarks,
        minimumMarksForCoAttainment,
        createdBy: req.employee,
        images: [],
        bl,
      };

      if (req.files && req.files.images) {
        if (Array.isArray(req.files.images)) {
          for (let image of req.files.images) {
            let link = await uploadFileToS3(image);
            if (link) data.images.push(link);
          }
        } else {
          let link = await uploadFileToS3(req.files.images);
          if (link) data.images.push(link);
        }
      }

      let newQuestion = await myQuestionBankQuery.create(data);
      return common.successResponse({
        result: newQuestion,
        statusCode: httpStatusCode.ok,
        message: "Question bank question created successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const filter = { ...search };

      const questions = await myQuestionBankQuery.findAll(filter);
      return common.successResponse({
        result: questions,
        statusCode: httpStatusCode.ok,
        message: "Question bank questions fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      let questionExists = await myQuestionBankQuery.findOne({
        _id: req.params.id,
      });
      if (!questionExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Question bank question not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (questionExists.images?.length) {
        await Promise.all(
          questionExists.images.map((image) => {
            return deleteFile(image);
          })
        );
      }

      await myQuestionBankQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Question bank question deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  //   TODO:
  static createAuto(req) {
    try {
      const { subject, cos, numberOfQuestions, isMcq, difficultyLecel } =
        req.body;
    } catch (error) {}
  }
};
