const semesterSubjectMappingHelper = require("@services/helper/semesterSubjectMapping");

module.exports = class SemesterSubjectMappingController {
  async create(req) {
    try {
      const result = await semesterSubjectMappingHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await semesterSubjectMappingHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await semesterSubjectMappingHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await semesterSubjectMappingHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async processSubjectAllocation(req) {
    try {
      const result =
        await semesterSubjectMappingHelper.processSubjectAllocation(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
