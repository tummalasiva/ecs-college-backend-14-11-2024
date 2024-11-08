const httpStatusCode = require("@generics/http-status");
const invigilatorRoleQuery = require("@db/invigilatorRole/queries");
const common = require("@constants/common");

module.exports = class InvigilatorRoleHelper {
  static async create(req) {
    try {
      const { name, description } = req.body;
      const invigilatorRoleExist = await invigilatorRoleQuery.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });

      if (invigilatorRoleExist)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invigilator role already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const newInvigilatorRole = await invigilatorRoleQuery.create({
        name,
        description,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Invigilator role created successfully",
        result: newInvigilatorRole,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const invigilatorRoles = await invigilatorRoleQuery.findAll();
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: invigilatorRoles,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { name, description } = req.body;

      let invigilatorRoleExists = await invigilatorRoleQuery.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: req.params.id },
      });
      if (invigilatorRoleExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invigilator role with this name already exists!",
          responseCode: "CLIENT_ERROR",
        });

      let updatedRole = await invigilatorRoleQuery.updateOne(
        { _id: req.params.id },
        { $set: { name, description } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Invigilator role updated successfully",
        result: updatedRole,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await invigilatorRoleQuery.deleteOne({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Invigilator role deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
