const internalExamHelper = require("@services/helper/internalExam");

module.exports = class InternalExamController {
  async create(req) {
    try {
      const createdInternalExam = await internalExamHelper.create(req);
      return createdInternalExam;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedInternalExam = await internalExamHelper.update(req);
      return updatedInternalExam;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const deletedInternalExam = await internalExamHelper.delete(req);
      return deletedInternalExam;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const internalExams = await internalExamHelper.list(req);
      return internalExams;
    } catch (error) {
      return error;
    }
  }
};
