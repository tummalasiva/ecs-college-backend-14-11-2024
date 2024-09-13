const coOutcomeService = require("@services/helper/coOutcome");

module.exports = class POOutcomeController {
  async create(req) {
    try {
      const result = await coOutcomeService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const results = await coOutcomeService.list(req);
      return results;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await coOutcomeService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await coOutcomeService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
