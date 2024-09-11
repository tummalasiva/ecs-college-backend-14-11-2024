const subjectTypeService = require("@services/helper/subjectType");

module.exports = class SujectTypeController {
  async create(req) {
    try {
      const result = await subjectTypeService.create(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async list(req) {
    try {
      const result = await subjectTypeService.list(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update(req) {
    try {
      const result = await subjectTypeService.update(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async delete(req) {
    try {
      const result = await subjectTypeService.delete(req);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
