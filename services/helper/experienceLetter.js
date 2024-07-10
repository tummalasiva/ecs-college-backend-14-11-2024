const experienceLetterQuery = require("@db/experienceLetter/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class ExperienceLetterService {
  static async create(body) {
    try {
      const experienceLetter = await experienceLetterQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `Experience letter for ${body.name} has been created successfully!`,
        result: experienceLetter,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let experienceLetterList = await experienceLetterQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: experienceLetterList,
        message: "Experience letters fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      let experienceLetter = await experienceLetterQuery.updateOne(
        { _id: id },
        body,
        {
          new: true,
        }
      );
      if (experienceLetter) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: `Experience letter for ${experienceLetter.name} has updated successfully!`,
          result: experienceLetter,
        });
      } else {
        return common.failureResponse({
          message: "Experience letter not found!",
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
      let experienceLetter = await experienceLetterQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `Experince letter for ${experienceLetter.name} has been deleted successfully!`,
        result: experienceLetter,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let experienceLetter = await experienceLetterQuery.findOne({ _id: id });

      if (experienceLetter) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Offer letter fetched successfully!",
          result: experienceLetter,
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
