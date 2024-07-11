const assignmentQuery = require("@db/assignment/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class NewsService {
  static async create(body, files) {
    try {
      let image = "";
      if (files) {
        image = await uploadFileToS3(files.file);
      }
      body.file = image;
      let assignment = await assignmentQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Assignment added successfully",
        result: assignment,
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

      let assignments = [];
      if (filter.section && filter.section !== "all") {
        assignments = await assignmentQuery.findAll({
          $or: [
            { ...filter },
            {
              class: filter.class,
              section: "all",
              school: filter.school,
            },
          ],
        });
      } else {
        assignments = await assignmentQuery.findAll({
          ...filter,
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: assignments,
        message: "Assignment fetched successfully!",
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
      let newsList = await assignmentQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: newsList,
        message: "Assignment fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId, files) {
    try {
      let image = "";
      if (files) {
        image = await uploadFileToS3(files.file);
        body.file = image;
      }

      let assignmentWithGivenId = await assignmentQuery.findOne({ _id: id });
      if (!assignmentWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Assignment not found!",
          statusCode: "CLIENT_ERROR",
        });
      if (assignmentWithGivenId.file) {
        await deleteFile(assignmentWithGivenId.file);
      }
      let assignment = await assignmentQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (assignment) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Assignment updated successfully!",
          result: assignment,
        });
      } else {
        return common.failureResponse({
          message: "Assignment not found!",
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
      let assignmentWithGivenId = await assignmentQuery.findOne({ _id: id });
      if (!assignmentWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Assignment not found!",
          statusCode: "CLIENT_ERROR",
        });
      if (assignmentWithGivenId.file) {
        await deleteFile(assignmentWithGivenId.file);
      }
      let assignment = await assignmentQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Assignment deleted successfully!",
        result: assignment,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let assignment = await assignmentQuery.findOne({ _id: id });

      if (assignment) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Assignment fetched successfully!",
          result: assignment,
        });
      } else {
        return common.failureResponse({
          message: "Assignment not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
