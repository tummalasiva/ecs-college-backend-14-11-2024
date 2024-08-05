const studentMarkService = require("@services/helper/studentMark");

module.exports = class StduentMarkController {
  async listStudentMarks(req) {
    try {
      const result = await studentMarkService.listStudentMarks(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateStudentsMarks(req) {
    try {
      const result = await studentMarkService.updateStudentsMarks(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getbulkUpdateStudentMarks(req) {
    try {
      const result = await studentMarkService.getbulkUpdateStudentMarks(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async bulkUpdateStudentMarks(req) {
    try {
      const result = await studentMarkService.bulkUpdateStudentMarks(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getbulkUpdateAllSectionStudentMarks(req) {
    try {
      const result =
        await studentMarkService.getbulkUpdateAllSectionStudentMarks(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getSubjectMarksSheet(req) {
    try {
      const result = await studentMarkService.getSubjectMarksSheet(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async getExamResult(req) {
    try {
      const result = await studentMarkService.getExamResult(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadExamResult(req) {
    try {
      const result = await studentMarkService.downloadExamResult(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
