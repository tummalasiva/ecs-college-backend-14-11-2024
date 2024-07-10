const studentAttendanceService = require("@services/helper/studentAttendance");

module.exports = class StudentAttendanceController {
  async list(req) {
    try {
      const result = await studentAttendanceService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await studentAttendanceService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getAttendanceReport(req) {
    try {
      const result = await studentAttendanceService.getAttendanceReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getAttendanceOverview(req) {
    try {
      const result = await studentAttendanceService.getAttendanceOverview(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async donwloadAbsentReport(req) {
    try {
      const result = await studentAttendanceService.donwloadAbsentReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getAttendanceSummaryForToday(req) {
    try {
      const result =
        await studentAttendanceService.getAttendanceSummaryForToday(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
