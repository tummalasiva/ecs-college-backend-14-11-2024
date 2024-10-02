const semesterHelper = require("@services/helper/semester");

module.exports = class SemesterHelper {
  async create(req) {
    try {
      const result = await semesterHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await semesterHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await semesterHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await semesterHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
