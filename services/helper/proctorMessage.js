const proctorMessageQuery = require("@db/proctorMessage/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class ProctorMessageService {
  static async create(req) {
    try {
      const { message } = req.body;
      const newProctorMessage = await proctorMessageQuery.create({
        message: message,
        createdBy: req.employee,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Proctor Message added successfully!",
        result: newProctorMessage,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await proctorMessageQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: list,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getMyMessages(req) {
    try {
      const list = await proctorMessageQuery.findAll({
        createdBy: req.student?.mentor?._id,
      });
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
      const updatedDoc = await proctorMessageQuery.updateOne(
        { _id: req.params.id },
        { $set: { message: req.body.message } }
      );
      if (!updatedDoc)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Message not found",
        });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Message updated successfully",
        result: updatedDoc,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const deletedDoc = await proctorMessageQuery.delete({
        _id: req.params.id,
      });
      if (!deletedDoc)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Message not found",
        });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Message deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
