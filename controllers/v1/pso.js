const psoHelper = require("@services/helper/pso");

module.exports = class PsoController {
  async create(req) {
    try {
      const result = await psoHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await psoHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await psoHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await psoHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
