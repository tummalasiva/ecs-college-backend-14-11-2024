const messMenuHelper = require("@services/helper/messMenu");

module.exports = class MessMenuController {
  async create(req) {
    try {
      const result = await messMenuHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await messMenuHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    try {
      const result = await messMenuHelper.details(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await messMenuHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await messMenuHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
