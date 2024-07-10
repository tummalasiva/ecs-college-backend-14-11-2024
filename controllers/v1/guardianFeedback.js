const guardianFeedbackService = require("@services/helper/guardianFeedback");

module.exports = class GuardianFeedbackController {
  async create(req) {
    const bodyData = {
      ...req.body,
      school: req.body.schoolId,
    };
    try {
      const result = await guardianFeedbackService.create(bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await guardianFeedbackService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listPublic(req) {
    try {
      const result = await guardianFeedbackService.listPublic(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = { ...req.body };
    delete bodyData.school;
    const _id = req.params.id;
    try {
      const result = await guardianFeedbackService.update(_id, bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await guardianFeedbackService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
