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

  async getMarksUpdateSheet(req) {
    try {
      const deletedCieExam = await cieExamService.getMarksUpdateSheet(req);
      return deletedCieExam;
    } catch (error) {
      return error;
    }
  }

  async uploadMarks(req) {
    try {
      const deletedCieExam = await cieExamService.uploadMarks(req);
      return deletedCieExam;
    } catch (error) {
      return error;
    }
  }

  async getSingleMarksUpdateSheet(req) {
    try {
      const sampleSheet = await cieExamService.getSingleMarksUpdateSheet(req);
      return sampleSheet;
    } catch (error) {
      return error;
    }
  }

  async uploadMarksSingle(req) {
    try {
      const sampleSheet = await cieExamService.uploadMarksSingle(req);
      return sampleSheet;
    } catch (error) {
      return error;
    }
  }

  async downloadStudentMarks(req) {
    try {
      const studentMarks = await cieExamService.downloadStudentMarks(req);
      return studentMarks;
    } catch (error) {
      return error;
    }
  }

  async getCOAttainment(req) {
    try {
      const studentMarks = await cieExamService.getCOAttainment(req);
      return studentMarks;
    } catch (error) {
      return error;
    }
  }

  async getCOAttainmentCourseLevel(req) {
    try {
      const studentMarks = await cieExamService.getCOAttainmentCourseLevel(req);
      return studentMarks;
    } catch (error) {
      return error;
    }
  }

  async getPOAttainment(req) {
    try {
      const studentMarks = await cieExamService.getPOAttainment(req);
      return studentMarks;
    } catch (error) {
      return error;
    }
  }

  async getPSOAttainment(req) {
    try {
      const studentMarks = await cieExamService.getPSOAttainment(req);
      return studentMarks;
    } catch (error) {
      return error;
    }
  }
};
