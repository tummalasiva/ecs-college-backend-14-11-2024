const poOutcomeService = require("@services/helper/poOutcome");

module.exports = class POOutcomeController {
  async create(req) {
    try {
      const result = await poOutcomeService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const results = await poOutcomeService.list(req);
      return results;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await poOutcomeService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await poOutcomeService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
