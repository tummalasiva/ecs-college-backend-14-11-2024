const messMenuQuery = require("@db/messMenu/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class MessMenuHelper {
  static async create(req) {
    try {
      const newMenu = await messMenuQuery.create(req.body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Mess menu created successfully!",
        result: newMenu,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    try {
      const menus = await messMenuQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: menus,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { id } = req.params;
      const updatedmenu = await messMenuQuery.updateOne({ _id: id }, req.body, {
        new: true,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Mess menu updated successfully!",
        result: updatedmenu,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const { id } = req.params;
      await messMenuQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Mess menu deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
