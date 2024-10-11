const collegeEventHelper = require("@services/helper/collegeEvent");

module.exports = class CollegeEventController {
  async create(req) {
    try {
      const result = await collegeEventHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await collegeEventHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await collegeEventHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  //

  async list(req) {
    try {
      const result = await collegeEventHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async toggleApproveStatus(req) {
    try {
      const result = await collegeEventHelper.toggleApproveStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
