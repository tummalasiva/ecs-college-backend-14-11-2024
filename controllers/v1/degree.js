const degreeHelper = require("@services/helper/degree");

module.exports = class DegreeController {
  async create(req) {
    try {
      const result = await degreeHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await degreeHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await degreeHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await degreeHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
