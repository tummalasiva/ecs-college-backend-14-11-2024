const sectionQuery = require("@db/section/queries");
const classQuery = require("@db/class/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class SectionService {
  static async create(body) {
    try {
      const sectionExist = await sectionQuery.findOne({
        name: { $regex: new RegExp(`^${body.name}$`, "i") },
        class: body.class,
        school: body.school,
      });
      if (sectionExist) {
        return common.failureResponse({
          message: "Section already exists! Please try another name",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const classExist = await classQuery.findOne({
        _id: ObjectId(body.class),
      });
      if (!classExist) {
        return common.failureResponse({
          message: `No class found using ${body.class} id`,
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      body.fallbackClass = classExist;

      const newSection = await sectionQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Seection created successfully!",
        result: newSection,
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
      let sectionList = await sectionQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Sections fetched successfully",
        result: sectionList,
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
      filter["active"] = true;
    }
    try {
      let sectionList = await sectionQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Sections fetched successfully",
        result: sectionList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      let sectionExist = await sectionQuery.findOne({
        name: { $regex: new RegExp(`^${body.name}$`, "i") },
        _id: { $ne: id },
        class: body.class,
      });
      if (sectionExist) {
        return common.failureResponse({
          message: "Section already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      let sections = await sectionQuery.updateOne({ _id: id }, body);
      if (sections) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Section updated successfully!",
          result: sections,
        });
      } else {
        return common.failureResponse({
          message: "Section not found!",
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
      let sections = await sectionQuery.delete({ _id: id });

      if (sections) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Section deleted successfully!",
          result: sections,
        });
      } else {
        return common.failureResponse({
          message: "Section not found!",
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
      let section = await sectionQuery.findOne({ _id: id });

      if (section) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Section fetched successfully",
          result: section,
        });
      } else {
        return common.failureResponse({
          message: "Section not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
