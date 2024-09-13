const programOutcomeService = require("@services/helper/programOutcome");

module.exports = class ProgramOutcomeController {
  async create(req) {
    try {
      const result = await programOutcomeService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const results = await programOutcomeService.list(req);
      return results;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await programOutcomeService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await programOutcomeService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
