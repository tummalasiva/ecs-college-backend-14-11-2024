const reportService = require("@services/helper/reports");

module.exports = class ReportController {
  async groupedLibraryData(req) {
    try {
      const result = await reportService.groupedLibraryData(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadGroupedLibraryData(req) {
    try {
      const result = await reportService.downloadGroupedLibraryData(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getLibraryGraphData(req) {
    try {
      const result = await reportService.getLibraryGraphData(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  //done
  async getAllStudentsAttendanceReportForParticularMonth(req) {
    try {
      const result =
        await reportService.getAllStudentsAttendanceReportForParticularMonth(
          req
        );
      return result;
    } catch (error) {
      return error;
    }
  }

  // done
  async getStudentAttendanceReport(req) {
    try {
      const result = await reportService.getStudentAttendanceReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  // done
  async getEmployeeAttendanceReport(req) {
    try {
      const result = await reportService.getEmployeeAttendanceReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  // done
  async getAllEmployeesAttendanceReportForParticularMonth(req) {
    try {
      const result =
        await reportService.getAllEmployeesAttendanceReportForParticularMonth(
          req
        );
      return result;
    } catch (error) {
      return error;
    }
  }

  // done
  async getStudentReport(req) {
    try {
      const result = await reportService.getStudentReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  // done
  async downloadStudentReport(req) {
    try {
      const result = await reportService.downloadStudentReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  // done
  async getStudentActivityReport(req) {
    try {
      const result = await reportService.getStudentActivityReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  // done
  async getStudentActivityReportPdf(req) {
    try {
      const result = await reportService.getStudentActivityReportPdf(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
