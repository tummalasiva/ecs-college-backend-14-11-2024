const coursePlanHelper = require("@services/helper/coursePlan");

module.exports = class CoursePlanController {
  async updatePlan(req) {
    try {
      const result = await coursePlanHelper.updatePlan(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async list(req) {
    try {
      const result = await coursePlanHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async myCoursePlan(req) {
    try {
      const result = await coursePlanHelper.myCoursePlan(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateStatus(req) {
    try {
      const result = await coursePlanHelper.updateStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateFaculty(req) {
    try {
      const result = await coursePlanHelper.updateFaculty(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await coursePlanHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
