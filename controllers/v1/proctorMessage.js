const proctorMessageHelper = require("@services/helper/proctorMessage");

module.exports = class ProctorMessageController {
  async create(req) {
    try {
      const result = await proctorMessageHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await proctorMessageHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getMyMessages(req) {
    try {
      const result = await proctorMessageHelper.getMyMessages(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await proctorMessageHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await proctorMessageHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
