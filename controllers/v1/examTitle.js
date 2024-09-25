const examTitleService = require("@services/helper/examTitle");

module.exports = class ExamTitleController {
  async create(req) {
    try {
      const result = await examTitleService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await examTitleService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await examTitleService.updateOne(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await examTitleService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
