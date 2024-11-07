const httpStatusCode = require("@generics/http-status");
const scholarshipQuery = require("@db/scholarship/queries");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class ScholarshipHelper {
  static async create(req) {
    try {
      let document = "";
      if (req.files && req.files.document) {
        document = await uploadFileToS3(req.files.document);
      }

      const scholarship = await scholarshipQuery.create({
        ...req.body,
        document,
        student: req.student._id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Scholarship added successfully",
        result: scholarship,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    try {
      let scholarships = await scholarshipQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Scholarship fetched successfully",
        result: scholarships,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      let docExists = await scholarshipQuery.findOne({ _id: req.params.id });
      if (!docExists) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Scholarship not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      if (
        docExists.student?._id?.toHexString() !==
        req.student?._id?.toHexString()
      )
        return common.failureResponse({
          statusCode: httpStatusCode.forbidden,
          message: "Unauthorized to update scholarship of another student!",
          responseCode: "CLIENT_ERROR",
        });

      let document = docExists.document;
      if (req.files && req.files.document) {
        if (document) await deleteFile(document);
        document = await uploadFileToS3(req.files.document);
      }

      let updatedDoc = await scholarshipQuery.updateOne(
        { _id: req.params.id },
        { $set: { ...req.body, document } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Scholarship updated successfully",
        result: updatedDoc,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const deletedDoc = await scholarshipQuery.delete({ _id: req.params.id });
      if (!deletedDoc) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Scholarship not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Scholarship deleted successfully",
        result: deletedDoc,
      });
    } catch (error) {
      throw error;
    }
  }
};
