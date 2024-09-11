const degreeCodeQuery = require("@db/degreeCode/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");

module.exports = class DegreeCodeHelper {
  static async create(req) {
    try {
      const { degree, specialization, degreeCode } = req.body;

      let degreeCodeExists = await degreeCodeQuery.findOne({
        degree,
        specialization: { $regex: new RegExp(`^${specialization}^`, "i") },
      });
      if (degreeCodeExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Degee code already exists!",
          responseCode: "CLIENT_ERROR",
        });

      let newDegreeCode = await degreeCodeQuery.create(req.body);
      return common.successResponse({
        message: "Degree code added successfully!",
        statusCode: httpStatusCode.ok,
        result: newDegreeCode,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const list = await degreeCodeQuery.findAll();
      return list;
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { degree, specialization } = req.body;
      let degreeExists = await degreeCodeQuery.findOne({ _id: req.params.id });
      if (!degreeExists)
        return common.failureResponse({
          message: "Degree code was not found!",
          responseCode: "CLIENT_ERROR",
          statusCode: httpStatusCode.not_found,
        });

      let degreeCodeWithGivenSpecificationExists =
        await degreeCodeQuery.findOne({
          _id: { $ne: req.params.id },
          degree,
          specialization: { $regex: new RegExp(`^${specialization}^`, "i") },
        });
      if (degreeCodeWithGivenSpecificationExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Degee code with given specification already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const updatedDegreeCode = await degreeCodeQuery.updateOne(
        { _id: req.params.id },
        { $set: req.body }
      );
      return common.successResponse({
        message: " Degree code updated successfully!",
        result: updatedDegreeCode,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await degreeCodeQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Degree code deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
