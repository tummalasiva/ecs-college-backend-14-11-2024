const mentorMenteeQuery = require("@db/mentorMenteeReport/queries");
const studentQuery = require("@db/student/queries");
const semesterQuery = require("@db/semester/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const {
  uploadFileToS3,
  deleteFile,
  getDateRange,
} = require("../../helper/helpers");

module.exports = class MentorMenteeReportHelper {
  static async create(req) {
    try {
      const { studentId, points } = req.body;
      req.body.points = req.body.points.split(",");
      if (!Array.isArray(req.body.points))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Points should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let data = {
        points: req.body.points,
      };

      let activeSemester = await semesterQuery.findOne({ active: true });
      if (!activeSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let studentWithThisMentor = await studentQuery.findOne({
        mentor: req.employee,
        "academicInfo.semester": activeSemester._id,
      });
      if (!studentWithThisMentor)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No student found with this mentor in the active semester!",
          responseCode: "CLIENT_ERROR",
        });

      data["menteeId"] = studentId;
      data["mentorId"] = req.employee;
      data["semester"] = activeSemester._id;
      data["date"] = Date.now();

      if (req.files && req.files.file) {
        if (Array.isArray(req.files.file)) {
          let fileLinks = [];
          for (let file of req.files.file) {
            let link = await uploadFileToS3(file);
            if (link) {
              fileLinks.push(link);
            }
          }
          data["files"] = fileLinks;
        } else {
          let link = await uploadFileToS3(req.files.file);
          if (link) {
            data["files"] = [link];
          }
        }
      }

      let report = await mentorMenteeQuery.create(data);

      return common.successResponse({
        result: report,
        statusCode: httpStatusCode.ok,
        message: "Mentor-Mentee report created successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      let reportExists = await mentorMenteeQuery.findOne({
        _id: req.params.id,
      });
      if (!reportExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Mentor-Mentee report not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (reportExists.files?.length) {
        for (let file of reportExists.files) {
          await deleteFile(file);
        }
      }

      let report = await mentorMenteeQuery.delete({ _id: req.params.id });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Mentor-Mentee report deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;

      const filter = { ...search };

      if (filter.fromDate && filter.toDate) {
        const { endOfDay, startOfDay } = getDateRange(
          filter.fromDate,
          filter.toDate
        );
        filter["date"] = { $gte: startOfDay, $lte: endOfDay };
        delete filter.fromDate;
        delete filter.toDate;
      }

      const reports = await mentorMenteeQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: reports,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getDetails(req) {
    try {
      const report = await mentorMenteeQuery.findOne({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: report,
      });
    } catch (error) {
      throw error;
    }
  }
};
