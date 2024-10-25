const facultyReportQuery = require("@db/facultyReport/queries");
const employeeQuery = require("@db/employee/queries");
const semesterQuery = require("@db/semester/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const {
  notFoundError,
  uploadFileToS3,
  deleteFile,
} = require("../../helper/helpers");

module.exports = class FacultyReportService {
  static async create(req) {
    try {
      const { facultyId, date, topic, description } = req.body;
      const activeSemester = await semesterQuery.findOne({ active: true });
      if (!activeSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let facultyExists = await employeeQuery.findOne({
        _id: facultyId,
        active: true,
      });
      if (!facultyExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Faculty not found!",
          responseCode: "CLIENT_ERROR",
        });

      let report = {
        date,
        topic,
        description,
        semester: activeSemester._id,
        addedBy: req.employee,
        files: [],
      };
      if (req.files && req.files?.file) {
        if (Array.isArray(req.files.file)) {
          let files = [];
          for (let file of req.files.file) {
            let link = await uploadFileToS3(file);
            if (link) files.push(link);
          }
          report["files"] = files;
        } else {
          let link = await uploadFileToS3(req.files.file);
          if (link) report["files"] = [link];
        }
      }

      let updatedReport = await facultyReportQuery.update(
        { faculty: facultyId },
        { $addToSet: { reports: report } },
        { upsert: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.created,
        message: "Faculty report updated successfully!",
        result: updatedReport,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { id } = req.params;
      const { search = {} } = req.query;
      let filter = { faculty: id, ...search };
      if (filter.fromData && filter.toDate) {
        const { startOfDay, endOfDay } = getDateRange(
          filter.fromDate,
          filter.toDate
        );
        filter["reports.date"] = { $gt: startOfDay, $lte: endOfDay };
        delete filter.fromDate;
        delete filter.toDate;
      }
      const activeSemester = await semesterQuery.findOne({ active: true });

      if (!activeSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      filter["reports.semester"] = activeSemester._id;

      let FacultyReports = await facultyReportQuery.findOne(filter);

      if (!FacultyReports)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Faculty report not found!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: FacultyReports.reports,
      });
    } catch (error) {
      throw error;
    }
  }

  static async removeReport(req) {
    try {
      const id = req.params.id;
      let report = await facultyReportQuery.findOne({ "reports._id": id });
      if (!report)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Report not found!",
          responseCode: "CLIENT_ERROR",
        });

      let reportData = report.reports.find((r) => r._id?.toHexString() === id);
      if (reportData.files?.length) {
        for (let file of reportData.files) {
          await deleteFile(file);
        }
      }

      let updatedReport = await facultyReportQuery.updateOne(
        { "reports._id": id },
        { $pull: { reports: { _id: id } } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Report deleted successfully!",
        result: updatedReport.reports,
      });
    } catch (error) {
      throw error;
    }
  }
};
