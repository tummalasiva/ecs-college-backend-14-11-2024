const publicationQuery = require("@db/publication/queries");
const employeeQuery = require("@db/employee/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class PublicationHelper {
  static async create(req) {
    try {
      const { type, details, date } = req.body;
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

      let newPublication = await publicationQuery.create({
        type,
        details,
        department: employee.academicInfo?.department?._id,
        createdBy: employee._id,
        approved: employee.userType === "hod" ? true : false,
        file,
        date,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Publication added successfully",
        result: newPublication,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;

      const publications = await publicationQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: publications,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      let docExists = await publicationQuery.findOne({ _id: req.params.id });
      if (!docExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Publication not found!",
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
      const updated = await publicationQuery.updateOne(
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
        message: "Publication updated successfully",
        result: updated,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await publicationQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Publication deleted successfully",
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }

  static async toggleApproveStatus(req) {
    try {
      const publication = await publicationQuery.updateOne(
        { _id: req.params.id },
        [{ $set: { approved: { $eq: ["$approved", false] } } }]
      );
      if (!publication)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Publication not found!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `Publication ${
          publication.approved ? "approved" : "disapproved"
        } successfully`,
        result: publication,
      });
    } catch (error) {
      throw error;
    }
  }
};
