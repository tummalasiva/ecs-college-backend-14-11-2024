const subjectCategoryQuery = require("@db/subjectCategory/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class SubjectCatgeoryHelper {
  static async create(req) {
    try {
      const { name, description } = req.body;
      const subjectTypeExist = await subjectCategoryQuery.findOne({
        name: { $regex: new RegExp(`^${name}^`, "i") },
      });
      if (subjectTypeExist)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject category already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const newSubjectType = await subjectCategoryQuery.create({
        name,
        description,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject category added successfully!",
        result: newSubjectType,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const subjectTypes = await subjectCategoryQuery.findAll();
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject categories fetched successfully!",
        result: subjectTypes,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await subjectCategoryQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject category deleted successfully!",
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const subjectCategoryExists = await subjectCategoryQuery.findOne({
        _id: req.params.id,
      });
      if (!subjectCategoryExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Subject category not found!",
          responseCode: "CLIENT_ERROR",
        });

      const subjectCategoryWithGivenNameExists =
        await subjectCategoryQuery.findOne({
          _id: { $ne: req.params.id },
          name: { $regex: new RegExp(`^${req.body.name}^`, "i") },
        });
      if (subjectCategoryWithGivenNameExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject category with the given name already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const updatedSubjectType = await subjectCategoryQuery.updateOne(
        { _id: req.params.id },
        { $set: req.body }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject category updated successfully!",
        result: updatedSubjectType,
      });
    } catch (error) {
      throw error;
    }
  }
};
