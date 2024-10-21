const copoAssessmentDistributionHelper = require("@services/helper/copoAssessmentDistribution");

module.exports = class CoPoAssessmentDistributionController {
  async update(req) {
    try {
      const result = await copoAssessmentDistributionHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getDetails(req) {
    try {
      const result = await copoAssessmentDistributionHelper.getDetails(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
