const employeeAttendanceService = require("@services/helper/employeeAttendance");

module.exports = class EmployeeAttendanceController {
  async list(req) {
    try {
      const result = await employeeAttendanceService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await employeeAttendanceService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getAttendanceReport(req) {
    try {
      const result = await employeeAttendanceService.getAttendanceReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getEmployeeAttendanceSummaryForToday(req) {
    try {
      const result =
        await employeeAttendanceService.getEmployeeAttendanceSummaryForToday(
          req
        );
      return result;
    } catch (error) {
      return error;
    }
  }
};
