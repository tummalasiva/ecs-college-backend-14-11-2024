const awardQuery = require("@db/awards/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class AwardService {
  static async create(body, files) {
    try {
      let image = "";
      if (files) {
        image = await uploadFileToS3(files.file);
      }
      body.image = image;
      let award = await awardQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Award added successfully",
        result: award,
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
      let awards = await awardQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: awards,
        message: "Award fetched successfully!",
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
      let awards = await awardQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: awards,
        message: "Award fetched successfully!",
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

      let awardWithGivenId = await awardQuery.findOne({ _id: id });
      if (!awardWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Award not found!",
          statusCode: "CLIENT_ERROR",
        });
      if (awardWithGivenId.image) {
        await deleteFile(awardWithGivenId.image);
      }
      let award = await awardQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (award) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Award updated successfully!",
          result: award,
        });
      } else {
        return common.failureResponse({
          message: "Award not found!",
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
      let awardWithGivenId = await awardQuery.findOne({ _id: id });
      if (!awardWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Award not found!",
          statusCode: "CLIENT_ERROR",
        });
      if (awardWithGivenId.image) {
        await deleteFile(awardWithGivenId.image);
      }
      let award = await awardQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Award deleted successfully!",
        result: award,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let award = await awardQuery.findOne({ _id: id });

      if (award) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Award fetched successfully!",
          result: award,
        });
      } else {
        return common.failureResponse({
          message: "Award not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
