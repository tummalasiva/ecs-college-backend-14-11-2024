const academicRegulationHelper = require("@services/helper/academicRegulation");

module.exports = class AcademicRegulationController {
  async create(req) {
    try {
      const result = await academicRegulationHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await academicRegulationHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getDetails(req) {
    try {
      const result = await academicRegulationHelper.getDetails(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await academicRegulationHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const regulations = await academicRegulationHelper.list(req);
      return regulations;
    } catch (error) {
      return error;
    }
  }
};
