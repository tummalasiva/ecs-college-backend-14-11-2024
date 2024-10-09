const feedbackQuery = require("@db/feedback/queries");
const questionnaireQuery = require("@db/questionnaire/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class feedbackHelper {
  static async create(req) {
    try {
      const student = req.student;
      const { questionnaireId, submittedResponse } = req.body;
      if (!Array.isArray(submittedResponse))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Submitted Response should be an array!",
          responseCode: "CLIENT_ERROR",
        });
      let questionnaireExists = await questionnaireQuery.findOne({
        _id: questionnaireId,
      });
      if (!questionnaireExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Questionnaire not found!",
          responseCode: "CLIENT_ERROR",
        });

      let feedbackExists = await questionnaireExists.submittedBy?.find(
        (s) => s.toHexString() === student?._id?.toHexString()
      );
      if (!feedbackExists)
        return common.failureResponse({
          statusCode: httpStatusCode.conflict,
          message: "Feedback already submitted for this questionnaire!",
          responseCode: "CLIENT_ERROR",
        });

      let newFeedback = await feedbackQuery.create({
        questionnaire: questionnaireId,
        submittedBy: student._id,
        submittedResponse,
      });

      let updatedQuestionnaire = await questionnaireQuery.updateOne(
        { _id: questionnaireId },
        { $addToSet: { submittedBy: student._id } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Feedback submitted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
