const assessmentPlanHelper = require("@services/helper/assessmentPlan");

module.exports = class AssessmentPlanController {
  async create(req) {
    try {
      const result = await assessmentPlanHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedAssessmentPlan = await assessmentPlanHelper.update(req);
      return updatedAssessmentPlan;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    try {
      const updatedAssessmentPlan = await assessmentPlanHelper.details(req);
      return updatedAssessmentPlan;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const deletedAssessmentPlan = await assessmentPlanHelper.delete(req);
      return deletedAssessmentPlan;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const assessmentPlans = await assessmentPlanHelper.list(req);
      return assessmentPlans;
    } catch (error) {
      return error;
    }
  }
};
