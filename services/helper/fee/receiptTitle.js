const receiptTitleQuery = require("@db/fee/receiptTitle/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class ReceiptTitleService {
  static async create(body) {
    try {
      const receiptTitleExist = await receiptTitleQuery.findOne({
        name: { $regex: new RegExp(`^${body.name}$`, "i") },
      });
      if (receiptTitleExist) {
        return common.failureResponse({
          message: "Receipt title already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const receiptTitle = await receiptTitleQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Receipt title created successfully!",
        result: receiptTitle,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let receiptTitleList = await receiptTitleQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: receiptTitleList,
        message: "Receipt titles fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      let receiptTitleWithName = await receiptTitleQuery.findOne({
        name: { $regex: new RegExp(`^${body.name}$`) },
        _id: { $ne: id },
      });
      if (receiptTitleWithName) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Receipt title with the given name already exists",
          responseCode: "CLIENT_ERROR",
        });
      }
      let receiptTitle = await receiptTitleQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (receiptTitle) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Receipt title updated successfully!",
          result: receiptTitle,
        });
      } else {
        return common.failureResponse({
          message: "Receipt title not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async toggleActiveStatus(id, userId) {
    try {
      let receiptTitle = await receiptTitleQuery.updateOne(
        { _id: id },
        [{ $set: { active: { $eq: ["$active", false] } } }],
        {
          new: true,
        }
      );
      if (receiptTitle) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: receiptTitle.active
            ? "Receipt Title activated successfully!"
            : "Receipt Title deactivated successfully!",
          result: receiptTitle,
        });
      } else {
        return common.failureResponse({
          message: "Receipt Title not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let receiptTitle = await receiptTitleQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Receipt Title deleted successfully!",
        result: receiptTitle,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let receiptTitle = await receiptTitleQuery.findOne({ _id: id });

      if (receiptTitle) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Receipt Title fetched successfully!",
          result: receiptTitle,
        });
      } else {
        return common.failureResponse({
          message: "Receipt Title not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
