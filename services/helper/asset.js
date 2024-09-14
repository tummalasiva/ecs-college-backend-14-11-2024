const assetQuery = require("@db/asset/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class AssetService {
  static async create(req) {
    try {
      const { name, serialNumber } = req.body;
      const assetExists = await assetQuery.findOne({
        serialNumber: { $regex: new RegExp(`^${serialNumber}`, "i") },
      });
      if (assetExists)
        return common.failureResponse({
          message: "Serial number already exists",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const newAsset = await assetQuery.create(req.body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Asset created successfully",
        result: newAsset,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }
      const result = await assetQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Assets fetched successfully",
        result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { serialNumber } = req.body;
      const assetExists = await assetQuery.findOne({
        _id: { $ne: req.params.id },
        serialNumber: serialNumber,
      });
      if (assetExists)
        return common.failureResponse({
          message: "Serial number already exists",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const updatedAsset = await assetQuery.updateOne(
        { _id: req.params.id },
        req.body
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Asset updated successfully",
        result: updatedAsset,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await assetQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Asset deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
