const roomTypeQuery = require("@db/roomType/queries");
const studentQuery = require("@db/student/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class RoomTypeservice {
  static async create(body) {
    try {
      const { name } = body;

      const roomTypeExist = await roomTypeQuery.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });

      if (roomTypeExist)
        return common.failureResponse({
          message: "Room type already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let newRoomType = await roomTypeQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Room type added successfully!",
        result: newRoomType,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    let filter = { ...search };

    try {
      let roomTypes = await roomTypeQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Room Types fetched successfully",
        result: roomTypes,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      const { name } = body;
      const roomTypeExist = await roomTypeQuery.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (roomTypeExist) {
        return common.failureResponse({
          message: "Room type with this name already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      let roomType = await roomTypeQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (roomType) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Room type updated successfully!",
          result: roomType,
        });
      } else {
        return common.failureResponse({
          message: "Room type data not found!",
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
      let studentWithGivenRoom = await studentQuery.findOne({
        "hostelInfo.roomType": id,
      });

      if (studentWithGivenRoom)
        return common.failureResponse({
          message:
            "Cannot delete room type as it is associated with some students!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      let roomType = await roomTypeQuery.delete({ _id: id });

      if (roomType) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Room type deleted successfully!",
          result: roomType,
        });
      } else {
        return common.failureResponse({
          message: "Room type not found!",
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
      let roomType = await roomTypeQuery.findOne({ _id: id });

      if (roomType) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Room Type fetched successfully",
          result: roomType,
        });
      } else {
        return common.failureResponse({
          message: "Room type not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
