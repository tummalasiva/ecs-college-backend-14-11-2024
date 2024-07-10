const leaveApplicationService = require("@services/helper/leaveApplication");

module.exports = class LeaveApplicationController {
  async createApplicationForEmployee(req) {
    const params = { ...req.body, school: req.schoolId };
    const files = req.files;
    try {
      const result = await leaveApplicationService.createEmployee(
        params,
        files,
        req.employee
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async createApplicationForStudent(req) {
    const params = { ...req.body, school: req.schoolId };
    const files = req.files;
    try {
      const result = await leaveApplicationService.createStudent(
        params,
        files,
        req.student
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async approveLeave(req) {
    try {
      const result = await leaveApplicationService.approveLeave(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async rejectLeave(req) {
    try {
      const result = await leaveApplicationService.rejectLeave(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async listEmployeeApplications(req) {
    try {
      const result = await leaveApplicationService.listEmployeeApplications(
        req
      );
      return result;
    } catch (error) {
      return error;
    }
  }
  async listStudentApplications(req) {
    try {
      const result = await leaveApplicationService.listStudentApplications(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await leaveApplicationService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async employeeLeaveCredits(req) {
    try {
      const result = await leaveApplicationService.employeeLeaveCredits(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadExcel(req) {
    try {
      const result = await leaveApplicationService.downloadExcel(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadPdf(req) {
    try {
      const result = await leaveApplicationService.downloadPdf(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
