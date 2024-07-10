const relievingLetterQuery = require("@db/relievingLetter/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class RelievingLetterService {
  static async create(body) {
    try {
      const relievingLetter = await relievingLetterQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `Relieving letter for ${body.name} has been created successfully!`,
        result: relievingLetter,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let relievingLetterList = await relievingLetterQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: relievingLetterList,
        message: "Relieving letters fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      let relievingLetter = await relievingLetterQuery.updateOne(
        { _id: id },
        body,
        {
          new: true,
        }
      );
      if (relievingLetter) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: `Relieving letter for ${relievingLetter.name} has been updated successfully!`,
          result: relievingLetter,
        });
      } else {
        return common.failureResponse({
          message: "Relieving letter not found!",
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
      let relievingLetter = await relievingLetterQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `Relieving letter for ${relievingLetter.name} has been deleted successfully!`,
        result: relievingLetter,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let relievingLetter = await relievingLetterQuery.findOne({ _id: id });

      if (relievingLetter) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Relieving letter fetched successfully!",
          result: relievingLetter,
        });
      } else {
        return common.failureResponse({
          message: "Relieving letter not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
