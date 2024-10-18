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

  async getMyCoursePlanSubjects(req) {
    try {
      const result = await coursePlanHelper.getMyCoursePlanSubjects(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getOthersCoursePlanSubjects(req) {
    try {
      const result = await coursePlanHelper.getOthersCoursePlanSubjects(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async mySubstitutePlan(req) {
    try {
      const result = await coursePlanHelper.mySubstitutePlan(req);
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

  async getWeeklyCoursePlans(req) {
    try {
      const result = await coursePlanHelper.getWeeklyCoursePlans(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getDaysOfCoursePlan(req) {
    try {
      const result = await coursePlanHelper.getDaysOfCoursePlan(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
