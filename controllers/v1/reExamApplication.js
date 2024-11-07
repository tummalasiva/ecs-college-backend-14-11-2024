const reExamApplication = require("@services/helper/reExamApplication");

module.exports = class ReExamApplicationController {
  async create(req) {
    try {
      const createdReExamApplication = await reExamApplication.create(req);
      return createdReExamApplication;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const allReExamApplications = await reExamApplication.list(req);
      return allReExamApplications;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    try {
      const reExamApplication = await reExamApplication.details(req);
      return reExamApplication;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedReExamApplication = await reExamApplication.update(req);
      return updatedReExamApplication;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const deletedReExamApplication = await reExamApplication.delete(req);
      return deletedReExamApplication;
    } catch (error) {
      return error;
    }
  }
};
