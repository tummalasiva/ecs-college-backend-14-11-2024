const guardianHelper = require("@services/helper/guardian");

module.exports = class GuardianController {
  async list(req) {
    try {
      const guardians = await guardianHelper.list(req);
      return guardians;
    } catch (error) {
      return error;
    }
  }

  async toggleActiveStatus(req) {
    try {
      const updatedGuardian = await guardianHelper.toggleActiveStatus(req);
      return updatedGuardian;
    } catch (error) {
      return error;
    }
  }

  async getProctorDetails(req) {
    try {
      const proctorDetails = await guardianHelper.getProctorDetails(req);
      return proctorDetails;
    } catch (error) {
      return error;
    }
  }

  async getSemeters(req) {
    try {
      const semesters = await guardianHelper.getSemesters(req);
      return semesters;
    } catch (error) {
      return error;
    }
  }

  async getAllSubjects(req) {
    try {
      const subjects = await guardianHelper.getAllSubjects(req);
      return subjects;
    } catch (error) {
      return error;
    }
  }

  async getAttendance(req) {
    try {
      const attendance = await guardianHelper.getAttendance(req);
      return attendance;
    } catch (error) {
      return error;
    }
  }
};
