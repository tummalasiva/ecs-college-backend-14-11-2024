const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const coursePlanQuery = require("@db/coursePlan/queries");
const semesterQuery = require("@db/semester/queries");
const labBatchQuery = require("@db/labBatch/queries");
const studentQuery = require("@db/student/queries");
const courseAssignmentQuery = require("@db/courseAssignment/queries");
const { uploadFileToS3 } = require("../../helper/helpers");

module.exports = class CourseAssignmentHelper {
  static async create(req) {
    try {
      const { coursePlanId, deadline, assignmentDescription, submissionType } =
        req.body;

      const [subject, section, year, semester, courseType] =
        coursePlanId.split("-");

      const data = {
        subject: subject,
        section: section,
        courseType: courseType?.toLowerCase(),
        deadline,
        assignmentDescription,
        createdBy: req.employee,
        semester: semester,
        submissionType,
        year,
      };

      if (courseType === "lab") {
        let labBatch = await labBatchQuery.findOne({
          semester: activeSemester._id,
          subject: subject,
          section: section,
          year: parseInt(year),
          faculty: req.employee,
        });

        if (!labBatch)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Lab batch not found for the provided course!",
            responseCode: "CLIENT_ERROR",
          });

        data["students"] = labBatch.students?.map((s) => s._id);
      } else {
        let studentFilter = {
          "aacdemicInfo.section": { $in: [section._id] },
          "academicInfo.year": year,
          registeredSubjects: { $in: [subject._id] },
          active: true,
          "academicInfo.semester": semester,
        };

        let allStudents = await studentQuery.findAll(studentFilter);
        data["students"] = allStudents.map((s) => s._id);
      }

      let courseAssignment = await courseAssignmentQuery.create(data);
      return common.successResponse({
        statusCode: httpStatusCode.created,
        message: "Course Assignment created successfully!",
        result: courseAssignment,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const allAssignment = await courseAssignmentQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: allAssignment,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const updatedAssigment = await courseAssignmentQuery.updateOne(
        { _id: req.params.id, createdBy: req.employee },
        { $set: req.body }
      );
      if (!updatedAssigment)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Assignment not found or not created by you!",
          responseCode: "CLIENT_ERROR",
        });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: updatedAssigment,
      });
    } catch (error) {
      throw error;
    }
  }

  static async toggleEnableSubmission(req) {
    try {
      const updatedAssigment = await courseAssignmentQuery.updateOne(
        { _id: req.params.id },
        [{ $set: { enableSubmission: { $eq: ["$enableSubmission", false] } } }]
      );
      if (!updatedAssigment)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Assignment not found!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: updatedAssigment,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const deletedAssigment = await courseAssignmentQuery.delete({
        _id: req.params.id,
        createdBy: req.employee,
      });

      if (!deletedAssigment)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Assignment not found or not created by you!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course Assignment deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async getMyAssignments(req) {
    try {
      const assingments = await courseAssignmentQuery.findAll({
        students: { $in: [req.student?._id] },
        enableSubmission: true,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: assingments,
      });
    } catch (error) {
      throw error;
    }
  }

  static async submitAssigment(req) {
    try {
      const { assignmentId, text } = req.body;
      let assignment = await courseAssignmentQuery.findOne({
        _id: assignmentId,
        enableSubmission: true,
        students: { $in: [req.student?._id] },
      });
      if (!assignment)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Assignment not found or not enabled for submission!",
          responseCode: "CLIENT_ERROR",
        });

      if (
        assignment.submissions?.find(
          (s) => s.student?.toHexString() === req.student?._id?.toHexString()
        )
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "You have already submitted this assignment!",
          responseCode: "CLIENT_ERROR",
        });

      let sumissionData = {
        student: req.student._id,
        submittedAt: new Date(),
      };
      if (assignment.submissionType === "file") {
        if (!req.files || !req.files.file)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "No file found to upload!",
            responseCode: "CLIENT_ERROR",
          });

        let uploadedFile = await uploadFileToS3(req.files.file);
        if (!uploadedFile)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Failed to upload file!",
            responseCode: "CLIENT_ERROR",
          });

        sumissionData["file"] = uploadedFile;
      } else {
        if (!text?.trim()?.length)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "No data provided for submission!",
            responseCode: "CLIENT_ERROR",
          });
        sumissionData["text"] = text;
      }

      let submission = await courseAssignmentQuery.updateOne(
        { _id: assignment._id },
        { $addToSet: { submissions: sumissionData } },
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Assignment submitted successfully!",
        result: submission,
      });
    } catch (error) {
      throw error;
    }
  }
};
