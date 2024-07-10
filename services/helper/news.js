const newsQuery = require("@db/news/queries");
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
      body.image = image;
      let news = await newsQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "News added successfully",
        result: news,
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
      let newsList = await newsQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: newsList,
        message: "News fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async listPublic(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }
      filter["isPublic"] = true;
      let newsList = await newsQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: newsList,
        message: "News fetched successfully!",
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
        body.image = image;
      }

      let newsWithGivenId = await newsQuery.findOne({ _id: id });
      if (!newsWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "News not found!",
          statusCode: "CLIENT_ERROR",
        });
      if (newsWithGivenId.image) {
        await deleteFile(newsWithGivenId.image);
      }
      let news = await newsQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (news) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "News updated successfully!",
          result: news,
        });
      } else {
        return common.failureResponse({
          message: "News not found!",
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
      let newsWithGivenId = await newsQuery.findOne({ _id: id });
      if (!newsWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "News not found!",
          statusCode: "CLIENT_ERROR",
        });
      if (newsWithGivenId.image) {
        await deleteFile(newsWithGivenId.image);
      }
      let news = await newsQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "News deleted successfully!",
        result: news,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let news = await newsQuery.findOne({ _id: id });

      if (news) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "News fetched successfully!",
          result: news,
        });
      } else {
        return common.failureResponse({
          message: "News not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
