const schoolSessionQuery = require("@db/session/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class SchoolSessionService {
  static async create(body) {
    try {
      const schoolSessionExist = await schoolSessionQuery.findOne({
        _id: req.schoolId,
      });
      if (schoolSessionExist) {
        return common.failureResponse({
          message: "Session information for this school already exsists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      const newSchoolSession = await schoolSessionQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Session created successfully!",
        result: newSchoolSession,
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
      let sessionList = await schoolSessionQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Sessions fetched successfully",
        result: sessionList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      //   let sessionWithGivenId = await schoolSessionQuery.findOne({_id: id});
      //   if(sessionWithGivenId) return common.failureResponse({
      //     statusCode: httpStatusCode.not_found,
      //     message:"Session not found!",
      //     responseCode: "CLIENT_ERROR",
      //   })

      let sessions = await schoolSessionQuery.updateOne({ _id: id }, body);
      if (sessions) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Session updated successfully!",
          result: sessions,
        });
      } else {
        return common.failureResponse({
          message: "Session not found!",
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
      let sessions = await schoolSessionQuery.delete({ _id: id });

      if (sessions) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Session deleted successfully!",
          result: sessions,
        });
      } else {
        return common.failureResponse({
          message: "Session not found!",
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
      let Session = await schoolSessionQuery.findOne({ _id: id });

      if (Session) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Session fetched successfully",
          result: Session,
        });
      } else {
        return common.failureResponse({
          message: "Session not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
