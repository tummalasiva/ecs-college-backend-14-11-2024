const subjectComponentService = require("@services/helper/subjectComponent");

module.exports = class SubjectComponentController {
  async create(req) {
    try {
      const result = await subjectComponentService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await subjectComponentService.list(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update(req) {
    try {
      const result = await subjectComponentService.update(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async delete(req) {
    try {
      const result = await subjectComponentService.delete(req);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
