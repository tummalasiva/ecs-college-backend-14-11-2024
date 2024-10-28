const messItemHelper = require("@services/helper/messItem");

module.exports = class MessItemController {
  async create(req) {
    try {
      const result = await messItemHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await messItemHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    try {
      const result = await messItemHelper.details(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await messItemHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await messItemHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
