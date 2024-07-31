const examAttendance = require("@services/helper/examAttendance");
const { request } = require("express");

module.exports = class ExamAttendanceController {
  async details(req) {
    try {
      const result = await examAttendance.details(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await examAttendance.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
