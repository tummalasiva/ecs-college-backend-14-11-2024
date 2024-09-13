const coOutcomeQuery = require("@db/coOutcome/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class CoOutcomeService {
  static async create(req) {
    try {
      const { poId, description, degreeCode, subject } = req.body;
      const coOutcomeExist = await coOutcomeQuery.findOne({
        poId: { $regex: new RegExp(`^${poId}^`, "i") },
        degreeCode,
        subject,
      });
      if (coOutcomeExist)
        return common.failureResponse({
          message:
            "PO Outcome with given PO ID and Degree Code already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const newCoOutcome = await coOutcomeQuery.create(req.body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "CO Outcome added successfully!",
        result: newCoOutcome,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await coOutcomeQuery.findAll(search);
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
      const { poId, description, degreeCode, subject } = req.body;
      const coOutcomeExist = await coOutcomeQuery.findOne({
        poId: { $regex: new RegExp(`^${poId}^`, "i") },
        degreeCode,
        subject,
        _id: { $ne: req.params.id },
      });

      if (coOutcomeExist)
        return common.failureResponse({
          message:
            "CO Outcome with given PO ID, Subject and Degree Code already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const updatedCoOutcome = await coOutcomeQuery.updateOne(
        { _id: req.params.id },
        req.body
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "PO Outcome updated successfully!",
        result: updatedCoOutcome,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const deletedCoOutcome = await coOutcomeQuery.delete({
        _id: req.params.id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "CO Outcome deleted successfully!",
        result: deletedCoOutcome,
      });
    } catch (error) {
      throw error;
    }
  }
};
