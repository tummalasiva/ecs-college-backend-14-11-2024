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

  static async list(req) {
    try {
      const result = await degreeCodeHelper.list(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const result = await degreeCodeHelper.delete(req);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const result = await degreeCodeHelper.update(req);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
