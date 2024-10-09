const feedbackHelper = require("@services/helper/feedback");

module.exports = class FeedbackController {
  async create(req) {
    try {
      const result = await feedbackHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await feedbackHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
