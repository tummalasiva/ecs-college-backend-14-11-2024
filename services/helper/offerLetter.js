const offerLetterQuery = require("@db/offerLetter/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class OfferLetterService {
  static async create(body) {
    try {
      const offerLetter = await offerLetterQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `Offer letter for ${body.name} has been created successfully!`,
        result: offerLetter,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let offerLetterList = await offerLetterQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: offerLetterList,
        message: "Offer letters fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      let offerLetter = await offerLetterQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (offerLetter) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: `Offer letter for ${offerLetter.name} has been updated successfully!`,
          result: offerLetter,
        });
      } else {
        return common.failureResponse({
          message: "Offer letter not found!",
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
      let offerLetter = await offerLetterQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `Offer letter for ${offerLetter.name} has been deleted successfully!`,
        result: offerLetter,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let offerLetter = await offerLetterQuery.findOne({ _id: id });

      if (offerLetter) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Offer letter fetched successfully!",
          result: offerLetter,
        });
      } else {
        return common.failureResponse({
          message: "Offer letter not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
