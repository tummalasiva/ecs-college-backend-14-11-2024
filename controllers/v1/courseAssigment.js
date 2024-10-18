const courseAssignmentHelper = require("@services/helper/courseAssignment");

module.exports = class CourseAssignmentController {
  async create(req) {
    try {
      const result = await courseAssignmentHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await courseAssignmentHelper.findAll(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await courseAssignmentHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await courseAssignmentHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async toggleEnableSubmission(req) {
    try {
      const result = await courseAssignmentHelper.toggleEnableSubmission(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getMyAssignments(req) {
    try {
      const result = await courseAssignmentHelper.getMyAssignments(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async submitAssigment(req) {
    try {
      const result = await courseAssignmentHelper.submitAssigment(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
