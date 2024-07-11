const noticeQuery = require("@db/notice/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class NoticeService {
  static async create(body) {
    try {
      let Notice = await noticeQuery.create(body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Notice added successfully",
        result: Notice,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }

      let NoticeList = await noticeQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: NoticeList,
        message: "Notice fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async listPublic(req) {
    try {
      const { search = {}, schoolId } = req.query;
      let filter = { ...search };
      if (schoolId) {
        filter["school"] = schoolId;
      }
      filter["isPublic"] = true;
      let NoticeList = await noticeQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: NoticeList,
        message: "Notice fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body) {
    try {
      let Notice = await noticeQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (Notice) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Notice updated successfully!",
          result: Notice,
        });
      } else {
        return common.failureResponse({
          message: "Notice not found!",
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
      let Notice = await noticeQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Notice deleted successfully!",
        result: Notice,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let Notice = await noticeQuery.findOne({ _id: id });

      if (Notice) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Notice fetched successfully!",
          result: Notice,
        });
      } else {
        return common.failureResponse({
          message: "Notice not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
