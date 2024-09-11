const buildingQueries = require("@db/building/queries");
const common = require("@constants/common");
const httpStatusCode = require("@generics/http-status");

module.exports = class BuildingService {
  static async create(req) {
    try {
      const { name, buildingType } = req.body;

      let buildingExists = await buildingQueries.findOne({
        name: { $regex: new RegExp(`^${name}^`, "i") },
        buildingType,
        school: req.schoolId,
      });
      if (buildingExists)
        return common.failureResponse({
          message: "Building with the given name already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let newBuilding = await buildingQueries.create({
        ...req.body,
        school: req.schoolId,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Building added successfully!",
        result: newBuilding,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      let filter = {};
      if (req.schoolId) {
        filter["schoolId"] = req.schoolId;
      }

      const result = await buildingQueries.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Buildings fetched successfully",
        result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await buildingQueries.delete({ _id: req.params.id });
      return common.successResponse({
        message: "Building deleted successfully!",
        statusCode: httpStatusCode.ok,
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { name, buildingType } = req.body;
      let buildingExists = await buildingQueries.findOne({
        _id: req.params.id,
      });
      if (!buildingExists)
        return common.failureResponse({
          message: "Building not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      let buidingWithGivenCredsExists = await buildingQueries.findOne({
        name: { $regex: new RegExp(`^${name}`, "i") },
        buildingType,
        school: req.schoolId,
        _id: { $ne: req.params.id },
      });
      if (buidingWithGivenCredsExists)
        return common.failureResponse({
          message: "Building with the given name already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let updatedBuilding = await buildingQueries.updateOne(
        { _id: req.params.id },
        { $set: req.body }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Building updated successfully!",
        result: updatedBuilding,
      });
    } catch (error) {
      throw error;
    }
  }
};
