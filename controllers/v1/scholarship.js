const scholarshipHelper = require("@services/helper/scholarship");

module.exports = class ScholarshipController {
  async create(req) {
    try {
      const result = await scholarshipHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await scholarshipHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await scholarshipHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await scholarshipHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
