const studentExamResultHelper = require("@services/helper/studentExamResult");

module.exports = class StudentExamResultController {
  async create(req) {
    try {
      const createdStudentExamResult = await studentExamResultHelper.create(
        req
      );
      return createdStudentExamResult;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await studentExamResultHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedStudentExamResult = await studentExamResultHelper.update(
        req
      );
      return updatedStudentExamResult;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await studentExamResultHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
