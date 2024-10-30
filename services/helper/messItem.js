const messItemQuery = require("@db/messItem/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class MessItemHelper {
  static async create(req) {
    try {
      const newItem = await new messItemQuery.create(req.body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Mess item created successfully!",
        result: newItem,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    try {
      const items = await messItemQuery.findAll(search);
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
      const updatedItem = await messItemQuery.updateOne({ _id: id }, req.body, {
        new: true,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Mess item updated successfully!",
        result: updatedItem,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const { id } = req.params;
      await messItemQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Mess item deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
