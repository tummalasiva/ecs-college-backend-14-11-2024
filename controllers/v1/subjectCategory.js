const subjectCategoryService = require("@services/helper/subjectCategory");

module.exports = class SujectCategoryController {
  async create(req) {
    try {
      const result = await subjectCategoryService.create(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async list(req) {
    try {
      const result = await subjectCategoryService.list(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update(req) {
    try {
      const result = await subjectCategoryService.update(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async delete(req) {
    try {
      const result = await subjectCategoryService.delete(req);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
