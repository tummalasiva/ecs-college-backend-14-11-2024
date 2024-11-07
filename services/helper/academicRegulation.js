const academicRegulationQuery = require("@db/academicRegulation/queries");
const AcademicRegulation = require("@db/");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class AcademicRegulationService {
  static async getDetails(req) {
    try {
      const regulation = await academicRegulationQuery.findOne({});
      if (!regulation) {
        let newRegulation = await academicRegulationQuery.create({});
        return common.successResponse({
          statusCode: httpStatusCode.created,
          message: "New academic regulation created successfully",
          data: newRegulation,
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Academic regulation details fetched successfully",
        data: regulation,
      });
    } catch (error) {}
  }
  static async update(req) {
    const { points } = req.body;
    if (!Array.isArray(points)) {
      return common.failureResponse({
        statusCode: httpStatusCode.bad_request,
        message: "Points should be an array",
        responseCode: "CLIENT_ERROR",
      });
    }

    let updatedDoc = await AcademicRegulation.findOneAndUpdate(
      {},
      { $addToSet: { points: { $each: points } } },
      { upsert: true }
    );
    return common.successResponse({
      statusCode: httpStatusCode.ok,
      message: "Academic regulation updated successfully",
      data: updatedDoc,
    });
  }

  static async delete(req) {
    try {
      const { points } = req.body;

      let updatedDoc = await AcademicRegulation.findOneAndUpdate(
        {},
        { $pull: { points: { $each: points } } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Academic regulation deleted successfully",
        data: updatedDoc,
      });
    } catch (error) {
      throw error;
    }
  }
};
