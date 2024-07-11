const eventQuery = require("@db/event/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class EventService {
  static async create(body, files) {
    try {
      let image = "";
      if (files) {
        image = await uploadFileToS3(files.file);
      }
      body.image = image;
      let event = await eventQuery.create({
        ...body,
        fromDate: new Date(body.fromDate),
        toDate: new Date(body.toDate),
        isPublic: body.isPublic === "true" ? true : false,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Event added successfully",
        result: event,
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
      let newsList = await eventQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: newsList,
        message: "Event fetched successfully!",
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
      let newsList = await eventQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: newsList,
        message: "Event fetched successfully!",
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

      let eventWithGivenId = await eventQuery.findOne({ _id: id });
      if (!eventWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Event not found!",
          statusCode: "CLIENT_ERROR",
        });
      if (eventWithGivenId.image) {
        await deleteFile(eventWithGivenId.image);
      }
      let event = await eventQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (event) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Event updated successfully!",
          result: event,
        });
      } else {
        return common.failureResponse({
          message: "Event not found!",
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
      let eventWithGivenId = await eventQuery.findOne({ _id: id });
      if (!eventWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Event not found!",
          statusCode: "CLIENT_ERROR",
        });
      if (eventWithGivenId.image) {
        await deleteFile(eventWithGivenId.image);
      }
      let event = await eventQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Event deleted successfully!",
        result: event,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let event = await eventQuery.findOne({ _id: id });

      if (event) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Event fetched successfully!",
          result: event,
        });
      } else {
        return common.failureResponse({
          message: "Event not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
