const holidayQuery = require("@db/holiday/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class HolidayService {
  static async create(body) {
    try {
      const newHoliday = await holidayQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Holiday created successfully!",
        result: newHoliday,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    let filter = { ...search };
    if (req.schoolId) {
      filter["school"] = req.schoolId;
    }
    try {
      let holidays = await holidayQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Holidays fetched successfully",
        result: holidays,
      });
    } catch (error) {
      throw error;
    }
  }

  static async listPublic(req) {
    const { search = {} } = req.query;
    let filter = { ...search };
    if (req.schoolId) {
      filter["school"] = req.schoolId;
      filter["isPublic"] = true;
    }
    try {
      let holidays = await holidayQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Holidays fetched successfully",
        result: holidays,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      let holidays = await holidayQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (holidays) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Holiday updated successfully!",
          result: holidays,
        });
      } else {
        return common.failureResponse({
          message: "Holiday data not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let holidays = await holidayQuery.delete({ _id: id });

      if (holidays) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Holiday deleted successfully!",
          result: holidays,
        });
      } else {
        return common.failureResponse({
          message: "Holiday not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let holiday = await holidayQuery.findOne({ _id: id });

      if (holiday) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Holiday fetched successfully",
          result: holiday,
        });
      } else {
        return common.failureResponse({
          message: "Holiday not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
