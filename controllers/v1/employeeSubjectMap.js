const employeeSubjectMapService = require("@services/helper/employeeSubjectMap");

module.exports = class EmployeeSubjectMapController {
  async assignSubjects(req) {
    try {
      const result = await employeeSubjectMapService.assignSubjects(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async removeSubject(req) {
    try {
      const result = await employeeSubjectMapService.removeSubject(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await employeeSubjectMapService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async mySubjects(req) {
    try {
      const result = await employeeSubjectMapService.mySubjects(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async myFilters(req) {
    try {
      const result = await employeeSubjectMapService.myFilters(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async upcomingLectures(req) {
    try {
      const result = await employeeSubjectMapService.upcomingLectures(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
