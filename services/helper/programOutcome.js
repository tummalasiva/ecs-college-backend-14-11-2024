const programOutcomeQuery = require("@db/programOutcome/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class ProgramOutcomeService {
  static async create(req) {
    try {
      const { poId, description, degreeCode } = req.body;
      const programOutcomeExist = await programOutcomeQuery.findOne({
        poId: { $regex: new RegExp(`^${poId}^`, "i") },
        degreeCode,
      });
      if (programOutcomeExist)
        return common.failureResponse({
          message:
            "Program Outcome with given PO ID and Degree Code already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const newProgramOutcome = await programOutcomeQuery.create(req.body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Program Outcome added successfully!",
        result: newProgramOutcome,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await programOutcomeQuery.findAll(search);
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
      const programOutcomeExist = await programOutcomeQuery.findOne({
        poId: { $regex: new RegExp(`^${poId}^`, "i") },
        degreeCode,
        _id: { $ne: req.params.id },
      });

      if (programOutcomeExist)
        return common.failureResponse({
          message:
            "Program Outcome with given PO ID and Degree Code already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const updatedProgramOutcome = await programOutcomeQuery.updateOne(
        { _id: req.params.id },
        req.body
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Program Outcome updated successfully!",
        result: updatedProgramOutcome,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const deletedProgramOutcome = await programOutcomeQuery.delete({
        _id: req.params.id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Program Outcome deleted successfully!",
        result: deletedProgramOutcome,
      });
    } catch (error) {
      throw error;
    }
  }
};
