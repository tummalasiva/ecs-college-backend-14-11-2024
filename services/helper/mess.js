const messQuery = require("@db/mess/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class MessHelper {
  static async create(req) {
    try {
      const newItem = await messQuery.create(req.body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Mess created successfully!",
        result: newItem,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    try {
      const items = await messQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: items,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { id } = req.params;
      const updatedItem = await messQuery.updateOne({ _id: id }, req.body, {
        new: true,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Mess updated successfully!",
        result: updatedItem,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const { id } = req.params;
      await messQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Mess deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
