const messHelper = require("@services/helper/mess");

module.exports = class MessController {
  async create(req) {
    try {
      const result = await messHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await messHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await messHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await messHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
