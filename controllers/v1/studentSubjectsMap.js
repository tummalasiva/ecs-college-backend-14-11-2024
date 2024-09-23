const studentSubjectsMappingHelper = require("@services/helper/studentSubjectsMap");

module.exports = class StudentSubjectMappingController {
  async assignSubjectToMultiple(req) {
    try {
      const result = await studentSubjectsMappingHelper.assignSubjectToMultiple(
        req
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async assignSubjectsToSingle(req) {
    try {
      const result = await studentSubjectsMappingHelper.assignSubjectsToSingle(
        req
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async registerSubject(req) {
    try {
      const result = await studentSubjectsMappingHelper.registerSubject(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async removeSubject(req) {
    try {
      const result = await studentSubjectsMappingHelper.removeSubject(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await studentSubjectsMappingHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async mySubjects(req) {
    try {
      const result = await studentSubjectsMappingHelper.mySubjects(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
