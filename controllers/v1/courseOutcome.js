const courseOutcomeService = require("@services/helper/courseOutcome");

module.exports = class CourseOutcomeController {
  async create(req) {
    try {
      const result = await courseOutcomeService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const results = await courseOutcomeService.list(req);
      return results;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await courseOutcomeService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await courseOutcomeService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
