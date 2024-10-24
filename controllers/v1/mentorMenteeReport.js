const mentorMenteeReportHelper = require("@services/helper/mentorMenteeReport");

module.exports = class MentorMenteeReportController {
  async create(req) {
    try {
      const result = await mentorMenteeReportHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await mentorMenteeReportHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    try {
      const result = await mentorMenteeReportHelper.details(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await mentorMenteeReportHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await mentorMenteeReportHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
