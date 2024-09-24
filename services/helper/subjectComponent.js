const subjectComponentQuery = require("@db/subjectComponent/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class SubjectComponentHelper {
  static async create(req) {
    try {
      const { name, hoursMultiplicationFactor } = req.body;
      const subjectComponentExist = await subjectComponentQuery.findOne({
        name: { $regex: new RegExp(`^${name}^`, "i") },
      });
      if (subjectComponentExist)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject component already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const newSubjectComponent = await subjectComponentQuery.create(req.body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject component added successfully!",
        result: newSubjectComponent,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const subjectComponents = await subjectComponentQuery.findAll();
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject components fetched successfully!",
        result: subjectComponents,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await subjectComponentQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject component deleted successfully!",
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const subjectComponentExists = await subjectComponentQuery.findOne({
        _id: req.params.id,
      });
      if (!subjectComponentExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Subject component not found!",
          responseCode: "CLIENT_ERROR",
        });

      const subjectComponentWithGivenNameExists =
        await subjectComponentQuery.findOne({
          _id: { $ne: req.params.id },
          name: { $regex: new RegExp(`^${req.body.name}^`, "i") },
        });
      if (subjectComponentWithGivenNameExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject component with the given name already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const updatedSubjectType = await subjectComponentQuery.updateOne(
        { _id: req.params.id },
        { $set: req.body }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subject component updated successfully!",
        result: updatedSubjectType,
      });
    } catch (error) {
      throw error;
    }
  }
};
