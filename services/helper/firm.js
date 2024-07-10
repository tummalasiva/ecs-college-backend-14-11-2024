const firmQuery = require("@db/transport/firm/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");

module.exports = class FirmService {
  static async create(body) {
    const { name } = body;

    try {
      let firmExists = await firmQuery.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
      if (firmExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Firm with this name already exists!",
        });

      let newFirm = await firmQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Firm added successfully",
        result: newFirm,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    try {
      let firms = await firmQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: firms,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      let firmExists = await firmQuery.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });
      if (firmExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Firm with this name already exists!",
        });

      let updatedFirm = await firmQuery.updateOne({ _id: id }, req.body, {
        new: true,
      });

      if (!updatedFirm) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Firm not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Firm updated successfully!",
        result: updatedFirm,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      await firmQuery.delete({
        _id: id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Firm removed successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let firm = await firmQuery.findOne({ _id: id });

      if (firm) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Firm fetched successfully",
          result: firm,
        });
      } else {
        return common.failureResponse({
          message: "Failed to find the Firm details",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
