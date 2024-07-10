const designationQuery = require("@db/designation/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");

module.exports = class designationService {
  static async create(body) {
    const { name } = body;
    try {
      const designationExist = await designationQuery.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
      if (designationExist) {
        return common.failureResponse({
          message: "designation already exists",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      let designationCount = await designationQuery.findAll();
      const designation = await designationQuery.create({
        name,
        orderSequence: designationCount.length + 1,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "designation created successfully",
        result: designation,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    try {
      let designationList = await designationQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: designationList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      const { name, orderSequence, note } = body;
      let designationWithName = await designationQuery.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
      if (designationWithName)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Designation with given name already exists! Please try with another name",
          responseCode: "CLIENT_ERROR",
        });

      let designationWithGivenId = await designationQuery.findOne({ _id: id });
      if (!designationWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Designation not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (designationWithGivenId.orderSequence !== orderSequence) {
        let designationWithGivenOrderSequence = await designationQuery.findOne({
          orderSequence,
        });
        if (!designationWithGivenOrderSequence) {
          let updateddesignation = await designationQuery.updateOne(
            { _id: id },
            { $set: { orderSequence, name, note } },
            { new: true }
          );
          return common.successResponse({
            result: updateddesignation,
            message: "designation updated successfully!",
            statusCode: httpStatusCode.ok,
          });
        } else {
          let orderSequenceForSecondDesignation =
            designationWithGivenId.orderSequence;

          let updateddesignation = await designationQuery.updateOne(
            { _id: id },
            { $set: { orderSequence, name, note } },
            { new: true }
          );
          let seconddesignation = await designationQuery.updateOne(
            { _id: designationWithGivenOrderSequence._id },
            { $set: { orderSequence: orderSequenceForSecondDesignation } }
          );

          return common.successResponse({
            result: updateddesignation,
            message: "designation updated successfully!",
            statusCode: httpStatusCode.ok,
          });
        }
      } else {
        let updateddesignation = await designationQuery.updateOne(
          { _id: id },
          { $set: { orderSequence, name, note } },
          { new: true }
        );
        return common.successResponse({
          result: updateddesignation,
          message: "designation updated successfully!",
          statusCode: httpStatusCode.ok,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let designation = await designationQuery.delete({
        _id: id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Designation deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let designation = await designationQuery.findOne({ _id: id });

      if (designation) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "designation fetched successfully",
          result: designation,
        });
      } else {
        return common.failureResponse({
          message: "Failed to find the designation details",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
