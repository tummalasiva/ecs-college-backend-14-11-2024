const codeOfConductQuery = require("@db/codeOfConduct/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class CodeOfConductService {
  static async create(req) {
    try {
      const { title, description } = req.body;
      const newCodeOfConduct = await codeOfConductQuery.create({
        title,
        description,
      });

      return common.successResponse({
        statusCode: httpStatusCode.OK,
        message: "Code of Conduct created successfully!",
        result: newCodeOfConduct,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const codeOfConductList = await codeOfConductQuery.findAll();
      return common.successResponse({
        statusCode: httpStatusCode.OK,
        result: codeOfConductList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const updatedCodeOfConduct = await codeOfConductQuery.updateOne(
        { _id: req.params.id },
        { $set: req.body }
      );

      return common.successResponse({
        statusCode: httpStatusCode.OK,
        message: "Code of Conduct updated successfully!",
        result: updatedCodeOfConduct,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await codeOfConductQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.OK,
        message: "Code of Conduct deleted successfully!",
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }
};
