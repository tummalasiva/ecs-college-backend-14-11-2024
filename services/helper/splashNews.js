const splashNewsQuery = require("@db/splashNews/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class SplashNewsService {
  static async create(body, files) {
    try {
      let image = "";
      let document = "";
      if (files) {
        if (files["image"]) {
          image = await uploadFileToS3(files.image);
        } else if (files["document"]) {
          document = await uploadFileToS3(files.document);
        }
      }
      body.image = image;
      body.document = document;
      let splashNews = await splashNewsQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Splash News added successfully",
        result: splashNews,
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
      let splashNews = await splashNewsQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: splashNews,
        message: "Splash News fetched successfully!",
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
      filter["enabled"] = true;
      let splashNews = await splashNewsQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: splashNews,
        message: "Splash News fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId, files) {
    try {
      let image = "";
      let document = "";
      if (files) {
        if (files["image"]) {
          image = await uploadFileToS3(files.image);
        } else if (files["document"]) {
          document = await uploadFileToS3(files.document);
        }
      }
      body.image = image;
      body.document = document;

      let splashNewsWithGivenId = await splashNewsQuery.findOne({ _id: id });
      if (!splashNewsWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Splash News not found!",
          statusCode: "CLIENT_ERROR",
        });
      if (splashNewsWithGivenId.image) {
        await deleteFile(splashNewsWithGivenId.image);
      }
      if (splashNewsWithGivenId.document) {
        await deleteFile(splashNewsWithGivenId.document);
      }
      let splashNews = await splashNewsQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (splashNews) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Splash News updated successfully!",
          result: splashNews,
        });
      } else {
        return common.failureResponse({
          message: "Splash News not found!",
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
      let splashNewsWithGivenId = await splashNewsQuery.findOne({ _id: id });
      if (!splashNewsWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Splash News not found!",
          statusCode: "CLIENT_ERROR",
        });
      if (splashNewsWithGivenId.image) {
        await deleteFile(splashNewsWithGivenId.image);
      }
      if (splashNewsWithGivenId.document) {
        await deleteFile(splashNewsWithGivenId.document);
      }
      let splashNews = await splashNewsQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Splash News deleted successfully!",
        result: splashNews,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let splashNews = await splashNewsQuery.findOne({ _id: id });

      if (splashNews) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Splash News fetched successfully!",
          result: splashNews,
        });
      } else {
        return common.failureResponse({
          message: "Splash News not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async toggleEnable(id) {
    try {
      const splashNewsWithGivenId = await splashNewsQuery.findOne({ _id: id });
      if (!splashNewsQuery) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Splash news not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      let updatedSplashNews = await splashNewsQuery.updateOne(
        { _id: id },
        [{ $set: { enabled: { $eq: ["$enabled", false] } } }],
        { new: true }
      );

      if (splashNewsWithGivenId.type === "Popup" && updatedSplashNews.enabled) {
        await splashNewsQuery.updateList(
          {
            type: "Popup",
            school: splashNewsWithGivenId.school._id,
            _id: { $ne: id },
          },
          { $set: { enabled: false } }
        );
      }

      return common.successResponse({
        result: updatedSplashNews,
        message: `Splash news ${
          updatedSplashNews.enabled ? "Enabled" : "Disabled"
        } successfully!`,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }
};
