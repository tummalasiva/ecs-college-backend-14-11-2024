const psoQuery = require("@db/pso/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class PsoHelper {
  static async create(req) {
    try {
      const pso = await psoQuery.create(req.body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Program Specific Outcome added successfully!",
        result: pso,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await psoQuery.findAll(search);
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
      const updatedPso = await psoQuery.updateOne(
        { _id: req.params.id },
        req.body
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Program Specific Outcome updated successfully!",
        result: updatedPso,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const deletedPso = await psoQuery.delete({
        _id: req.params.id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Program Specific Outcome deleted successfully!",
        result: deletedPso,
      });
    } catch (error) {
      throw error;
    }
  }
};
