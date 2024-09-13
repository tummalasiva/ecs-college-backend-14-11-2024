const poOutcomeQuery = require("@db/poOutcome/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class PoOutcomeService {
  static async create(req) {
    try {
      const { poId, description, degreeCode } = req.body;
      const poOutcomeExist = await poOutcomeQuery.findOne({
        poId: { $regex: new RegExp(`^${poId}^`, "i") },
        degreeCode,
      });
      if (poOutcomeExist)
        return common.failureResponse({
          message:
            "PO Outcome with given PO ID and Degree Code already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const newPoOutcome = await poOutcomeQuery.create(req.body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "PO Outcome added successfully!",
        result: newPoOutcome,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await poOutcomeQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: list,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { poId, description, degreeCode } = req.body;
      const poOutcomeExist = await poOutcomeQuery.findOne({
        poId: { $regex: new RegExp(`^${poId}^`, "i") },
        degreeCode,
        _id: { $ne: req.params.id },
      });

      if (poOutcomeExist)
        return common.failureResponse({
          message:
            "PO Outcome with given PO ID and Degree Code already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const updatedPoOutcome = await poOutcomeQuery.updateOne(
        { _id: req.params.id },
        req.body
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "PO Outcome updated successfully!",
        result: updatedPoOutcome,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const deletedPoOutcome = await poOutcomeQuery.delete({
        _id: req.params.id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "PO Outcome deleted successfully!",
        result: deletedPoOutcome,
      });
    } catch (error) {
      throw error;
    }
  }
};
