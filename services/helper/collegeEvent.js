const collegeEventQuery = require("@db/collegeEvent/queries");
const employeeQuery = require("@db/employee/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class CollegeEventHelper {
  static async create(req) {
    try {
      const { eventType, details, year } = req.body;
      let employee = await employeeQuery.findOne({ _id: req.employee });
      if (!employee)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Employee not found!",
          responseCode: "CLIENT_ERROR",
        });
      let file = "";
      if (req.files) {
        file = await uploadFileToS3(req.files.file);
      }

      let newAchievement = await collegeEventQuery.create({
        eventType,
        details,
        department: employee.academicInfo?.department?._id,
        createdBy: employee._id,
        approved: employee.userType === "hod" ? true : false,
        file,
        year,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `${eventType} added successfully`,
        result: newAchievement,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;

      const collegeEvents = await collegeEventQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: collegeEvents,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      let docExists = await collegeEventQuery.findOne({ _id: req.params.id });
      if (!docExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Document not found!",
          responseCode: "CLIENT_ERROR",
        });
      let file = docExists.file;
      if (req.files) {
        if (file) {
          await deleteFile(file);
        }
        file = await uploadFileToS3(req.files.file);
      }
      const updated = await collegeEventQuery.updateOne(
        { _id: req.params.id },
        { $set: { ...req.body, file, approved: false } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `${updated.eventType} updated successfully`,
        result: updated,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await collegeEventQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Document deleted successfully",
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }

  static async toggleApproveStatus(req) {
    try {
      const collegeEvent = await collegeEventQuery.updateOne(
        { _id: req.params.id },
        [{ $set: { approved: { $eq: ["$approved", false] } } }]
      );
      if (!collegeEvent)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Document not found!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `${collegeEvent.eventType} ${
          collegeEvent.approved ? "approved" : "disapproved"
        } successfully`,
        result: collegeEvent,
      });
    } catch (error) {
      throw error;
    }
  }
};
