const achievementQuery = require("@db/achievement/queries");
const employeeQuery = require("@db/employee/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class AchievementHelper {
  static async create(req) {
    try {
      const { achievementType, details, year } = req.body;
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

      let newAchievement = await achievementQuery.create({
        achievementType,
        details,
        department: employee.academicInfo?.department?._id,
        createdBy: employee._id,
        approved: employee.userType === "hod" ? true : false,
        file,
        year,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Achievement created successfully",
        result: newAchievement,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;

      const achievements = await achievementQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: achievements,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      let docExists = await achievementQuery.findOne({ _id: req.params.id });
      if (!docExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Achievement not found!",
          responseCode: "CLIENT_ERROR",
        });
      let employee = await employeeQuery.findOne({ _id: req.employee });
      if (!employee)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Employee not found!",
          responseCode: "CLIENT_ERROR",
        });
      let file = docExists.file;
      if (req.files) {
        if (file) {
          await deleteFile(file);
        }
        file = await uploadFileToS3(req.files.file);
      }
      const updated = await achievementQuery.updateOne(
        { _id: req.params.id },
        {
          $set: {
            ...req.body,
            file,
            approved: employee.userType === "hod" ? true : false,
          },
        }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Achievement updated successfully",
        result: updated,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await achievementQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Achievement deleted successfully",
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }

  static async toggleApproveStatus(req) {
    try {
      const achievement = await achievementQuery.updateOne(
        { _id: req.params.id },
        [{ $set: { approved: { $eq: ["$approved", false] } } }]
      );
      if (!achievement)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Achievement not found!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `Achievement ${
          achievement.approved ? "approved" : "disapproved"
        } successfully`,
        result: achievement,
      });
    } catch (error) {
      throw error;
    }
  }
};
