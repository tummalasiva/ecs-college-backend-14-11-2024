const copoAssessmentDistributionQuery = require("@db/copoAssessmentDitribution/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class CoPoAssessmentDistributionHelper {
  static async update(req) {
    try {
      const { directAssessment, indirectAssessment, department } = req.body;

      if (Number(directAssessment) + Number(indirectAssessment) !== 100)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Total percentage should be 100!",
          responseCode: "CLIENT_ERROR",
        });

      let updated = await copoAssessmentDistributionQuery.updateOne(
        {},
        { $set: { directAssessment, indirectAssessment, department } },
        { upsert: true, new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "COPO assessment distribution updated successfully!",
        result: updated,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getDetails(req) {
    try {
      const { departmentId } = req.query;
      const details = await copoAssessmentDistributionQuery.findOne({
        department: departmentId,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "COPO assessment distribution details fetched successfully!",
        result: details,
      });
    } catch (error) {
      throw error;
    }
  }
};
