const leaveApplicationService = require("@services/helper/leaveApplication");

module.exports = class LeaveApplicationController {
  async createApplicationForEmployee(req) {
    const params = { ...req.body };
    const files = req.files;
    try {
      const result =
        await leaveApplicationService.createEmployeeLeaveApplication(
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
    const params = { ...req.body };
    const files = req.files;
    try {
      const result =
        await leaveApplicationService.createStudentLeaveApplication(
          params,
          files,
          req.student
        );
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await leaveApplicationService.delete(req);
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
  async listMyApplications(req) {
    try {
      const result = await leaveApplicationService.listMyApplications(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async listApplicationsForApproval(req) {
    try {
      const result = await leaveApplicationService.listApplicationsForApproval(
        req
      );
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

  async getLeavesAppliedByEmployee(req) {
    try {
      const result = await leaveApplicationService.getLeavesAppliedByEmployee(
        req
      );
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
