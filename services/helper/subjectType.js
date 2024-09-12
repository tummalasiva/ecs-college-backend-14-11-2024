const subjectTypeQuery = require("@db/subjectType/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class SubjectTypeHelper {
  static async create(req) {
    try {
      const { name, description } = req.body;
      const subjectTypeExist = await subjectTypeQuery.findOne({
        name: { $regex: new RegExp(`^${name}^`, "i") },
      });
      if (subjectTypeExist)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject type already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const newSubjectType = await subjectTypeQuery.create({
        name,
        description,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject type added successfully!",
        result: newSubjectType,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const subjectTypes = await subjectTypeQuery.findAll();
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject types fetched successfully!",
        result: subjectTypes,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await subjectTypeQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject type deleted successfully!",
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const subjectTypeExists = await subjectTypeQuery.findOne({
        _id: req.params.id,
      });
      if (!subjectTypeExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Subject type not found!",
          responseCode: "CLIENT_ERROR",
        });

      const subjectTypeWithGivenNameExists = await subjectTypeQuery.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${req.body.name}^`, "i") },
      });
      if (subjectTypeWithGivenNameExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject type with the given name already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const updatedSubjectType = await subjectTypeQuery.findOne(
        { _id: req.params.id },
        { $set: req.body }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject type updated successfully!",
        result: updatedSubjectType,
      });
    } catch (error) {
      throw error;
    }
  }
};
