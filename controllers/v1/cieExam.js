const cieExamService = require("@services/helper/cieExam");

module.exports = class CieExamController {
  async create(req) {
    try {
      const createdCieExam = await cieExamService.create(req);
      return createdCieExam;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const cieExams = await cieExamService.list(req);
      return cieExams;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedCieExam = await cieExamService.update(req);
      return updatedCieExam;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const deletedCieExam = await cieExamService.delete(req);
      return deletedCieExam;
    } catch (error) {
      return error;
    }
  }
};
