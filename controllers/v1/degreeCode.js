const degreeCodeHelper = require("@services/helper/degreeCode");

module.exports = class DegreeCodeController {
  async create(req) {
    try {
      const result = await degreeCodeHelper.create(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async list(req) {
    try {
      const result = await degreeCodeHelper.list(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async delete(req) {
    try {
      const result = await degreeCodeHelper.delete(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update(req) {
    try {
      const result = await degreeCodeHelper.update(req);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
