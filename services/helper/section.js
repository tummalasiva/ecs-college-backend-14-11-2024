const sectionQuery = require("@db/section/queries");
const classQuery = require("@db/class/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class SectionService {
  static async create(body) {
    try {
      let filter = { name: { $regex: new RegExp(`^${body.name}$`, "i") } };
      if (body.programSpecific === true) {
        filter = {
          ...filter,
          programSpecific: true,
          degreeCode: body.degreeCode,
        };
      }
      const sectionExist = await sectionQuery.findOne(filter);
      if (sectionExist) {
        return common.failureResponse({
          message: "Section already exists! Please try another name",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

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
    let filter = { $or: [{ ...search }, { programSpecific: false }] };

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
    const { search = {}, schoolId } = req.query;
    let filter = { $or: [{ ...search }, { programSpecific: false }] };

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
      let filter = {
        name: { $regex: new RegExp(`^${body.name}$`, "i") },
        _id: { $ne: id },
      };

      if (body.programSpecific === true) {
        filter = {
          ...filter,
          programSpecific: true,
          degreeCode: body.degreeCode,
        };
      }
      let sectionExist = await sectionQuery.findOne(filter);
      if (sectionExist) {
        return common.failureResponse({
          message: "Section already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      let dataToUpdate = { ...body };
      if (body.programSpecific === false) {
        dataToUpdate.degreeCode = null;
      }

      let sections = await sectionQuery.updateOne({ _id: id }, dataToUpdate);
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
