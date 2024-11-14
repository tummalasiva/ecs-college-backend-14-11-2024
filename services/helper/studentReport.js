const studentReportQuery = require("@db/studentReport/queries");
const studentQuery = require("@db/student/queries");
const semesterQuery = require("@db/semester/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const {
  notFoundError,
  getDateRange,
  uploadFileToS3,
  deleteFile,
} = require("../../helper/helpers");

module.exports = class StudentReportService {
  static async create(req) {
    try {
      const { studentId, date, topic, description } = req.body;
      const activeSemester = await semesterQuery.findOne({ status: "active" });
      if (!activeSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let studentExists = await studentQuery.findOne({
        _id: studentId,
        "academicInfo.semester": activeSemester._id,
        active: true,
      });
      if (!studentExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student not found or not active in the current semester!",
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

      let updatedReport = await studentReportQuery.update(
        { student: studentId },
        { $addToSet: { reports: report } },
        { upsert: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.created,
        message: "Student report updated successfully!",
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
      let filter = { student: id, ...search };
      if (filter.fromDate && filter.toDate) {
        const { startOfDay, endOfDay } = getDateRange(
          filter.fromDate,
          filter.toDate
        );
        filter["reports.date"] = { $gt: startOfDay, $lte: endOfDay };
        delete filter.fromDate;
        delete filter.toDate;
      }
      const activeSemester = await semesterQuery.findOne({ status: "active" });

      if (!activeSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      filter["reports.semester"] = activeSemester._id;

      let studentReports = await studentReportQuery.findOne(filter);

      if (!studentReports)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student report not found!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: studentReports.reports,
      });
    } catch (error) {
      throw error;
    }
  }

  static async removeReport(req) {
    try {
      const id = req.params.id;
      let report = await studentReportQuery.findOne({ "reports._id": id });
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

      let updatedReport = await studentReportQuery.updateOne(
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
