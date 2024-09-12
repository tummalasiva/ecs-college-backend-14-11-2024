const degreeQuery = require("@db/degree/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");

module.exports = class DegreeService {
  static async create(req) {
    try {
      const { name, duration } = req.body;
      const degreeExist = await degreeQuery.findOne({
        name: { $regex: new RegExp(`^${name}^`, "i") },
        duration,
      });
      if (degreeExist) {
        return common.failureResponse({
          message: "Degree already exists",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      let degree = await degreeQuery.create(req.body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Degree created successfully",
        result: degree,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      let degreeList = await degreeQuery.findAll();
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: degreeList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      let degreeExists = await degreeQuery.findOne({ _id: req.params.id });
      if (!degreeExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Degree not found!",
          responseCode: "CLIENT_ERROR",
        });

      let degreeWithGivenNameExists = await degreeQuery.findOne({
        name: { $regex: new RegExp(`^${req.body.name}^`, "i") },
        _id: { $ne: req.params.id },
      });

      if (degreeWithGivenNameExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Degree with given name already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const updatedDegree = await degreeQuery.updateOne(
        { _id: req.params.id },
        { $set: req.body }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Degree updated successfully",
        result: updatedDegree,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      let degree = await degreeQuery.delete({ _id: id });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Degree deleted successfully!",
        result: degree,
      });
    } catch (error) {
      throw error;
    }
  }
};
