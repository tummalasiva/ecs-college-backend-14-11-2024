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

  async createExternal(req) {
    try {
      const createdInternalExam = await internalExamHelper.createExternal(req);
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

  async getSingleMarksUpdateSheet(req) {
    try {
      const sampleSheet = await internalExamHelper.getSingleMarksUpdateSheet(
        req
      );
      return sampleSheet;
    } catch (error) {
      return error;
    }
  }

  async uploadMarksSingle(req) {
    try {
      const sampleSheet = await internalExamHelper.uploadMarksSingle(req);
      return sampleSheet;
    } catch (error) {
      return error;
    }
  }

  async downloadStudentMarks(req) {
    try {
      const sampleSheet = await internalExamHelper.downloadStudentMarks(req);
      return sampleSheet;
    } catch (error) {
      return error;
    }
  }

  async getCOAttainment(req) {
    try {
      const studentMarks = await internalExamHelper.getCOAttainment(req);
      return studentMarks;
    } catch (error) {
      return error;
    }
  }

  async getCOAttainmentCourseLevel(req) {
    try {
      const studentMarks = await internalExamHelper.getCOAttainmentCourseLevel(
        req
      );
      return studentMarks;
    } catch (error) {
      return error;
    }
  }

  async getPOAttainment(req) {
    try {
      const studentMarks = await internalExamHelper.getPOAttainment(req);
      return studentMarks;
    } catch (error) {
      return error;
    }
  }

  async getPSOAttainment(req) {
    try {
      const studentMarks = await internalExamHelper.getPSOAttainment(req);
      return studentMarks;
    } catch (error) {
      return error;
    }
  }
};
