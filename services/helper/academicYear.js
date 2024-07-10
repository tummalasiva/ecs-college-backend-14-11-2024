const academicYearQuery = require("@db/academicYear/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class AcademicYearService {
  static async create(body) {
    try {
      const academicYearExist = await academicYearQuery.findOne({
        from: body.from,
        to: body.to,
      });
      if (academicYearExist) {
        return common.failureResponse({
          message: "Academic year already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const academicYear = await academicYearQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Academic year created successfully!",
        result: academicYear,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let academicYearList = await academicYearQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: academicYearList,
        message: "Academic years fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async listPublic(req) {
    try {
      let academicYearList = await academicYearQuery.findAll({});
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: academicYearList,
        message: "Academic years fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      let academicYear = await academicYearQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (academicYear) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Academic year updated successfully!",
          result: academicYear,
        });
      } else {
        return common.failureResponse({
          message: "Academic year not found!",
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
      let academicYear = await academicYearQuery.updateOne(
        { _id: id },
        [{ $set: { active: { $eq: ["$active", false] } } }],
        {
          new: true,
        }
      );
      if (academicYear) {
        if (academicYear.active) {
          await academicYearQuery.updateList(
            { _id: { $ne: id } },
            { active: false }
          );
        }
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: academicYear.active
            ? "Academic year activated successfully!"
            : "Academic year deactivated successfully!",
          result: academicYear,
        });
      } else {
        return common.failureResponse({
          message: "Academic year not found!",
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
      let academicYear = await academicYearQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Academic year deleted successfully!",
        result: academicYear,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let academicYear = await academicYearQuery.findOne({ _id: id });

      if (academicYear) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Academic year fetched successfully!",
          result: academicYear,
        });
      } else {
        return common.failureResponse({
          message: "Academic year not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
