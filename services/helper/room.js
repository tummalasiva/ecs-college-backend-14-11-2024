const roomQuery = require("@db/room/queries");
const studentQuery = require("@db/student/queries");
const hostelQuery = require("@db/hostel/queries");
const roomTypeQuery = require("@db/roomType/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class RoomService {
  static async create(body) {
    try {
      const { number, hostel } = body;
      const roomExist = await roomQuery.findOne({ number: number, hostel });

      if (roomExist)
        return common.failureResponse({
          message: "Room already exists for this hostel!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let newRoom = await roomQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Room added successfully!",
        result: newRoom,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    let filter = { ...search };

    try {
      let rooms = await roomQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Rooms fetched successfully",
        result: rooms,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      const { number, hostel, beds } = body;
      console.log(body, "body");
      const roomExist = await roomQuery.findOne({
        number: number,
        hostel,
        _id: { $ne: id },
      });

      if (roomExist) {
        return common.failureResponse({
          message: "Room with this number and hostel already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      let roomWithGivenId = await roomQuery.findOne({ _id: id });
      if (!roomWithGivenId)
        return common.failureResponse({
          message: "Room not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      let update = { ...body };
      delete update.beds;
      delete update.totalBeds;

      let room = await roomQuery.updateOne(
        { _id: id },
        { $set: update, $addToSet: { beds: { $each: beds } } },
        {
          new: true,
          runValidators: true,
        }
      );
      if (room) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Room updated successfully!",
          result: room,
        });
      } else {
        return common.failureResponse({
          message: "Room data not found!",
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
      let studentWithThisRoom = await studentQuery.findOne({
        "hostelInfo.room": id,
      });
      if (studentWithThisRoom) {
        return common.failureResponse({
          message: "Cannot delete room as it is associated with some students!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      let room = await roomQuery.delete({ _id: id });

      if (room) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Room deleted successfully!",
          result: room,
        });
      } else {
        return common.failureResponse({
          message: "Room not found!",
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
      let room = await roomQuery.findOne({ _id: id });

      if (room) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Room fetched successfully",
          result: room,
        });
      } else {
        return common.failureResponse({
          message: "Room not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async updateBed(id, body) {
    try {
      let room = await roomQuery.updateOne(
        { "beds._id": id },
        {
          $set: { "beds.$.name": body.name, "beds.$.position": body.position },
        },
        {
          new: true,
        }
      );
      if (room) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Bed updated successfully!",
          result: room,
        });
      } else {
        return common.failureResponse({
          message: "Bed not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async toggleBedStatus(id, userId) {
    try {
      let roomExists = await roomQuery.findOne({ "beds._id": id });
      if (!roomExists) {
        return common.failureResponse({
          message: "Room not found with given bed!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }

      let enabledStatus =
        roomExists.beds.find((b) => b._id.toString() === id)?.enabled === true
          ? false
          : true;
      let room = await roomQuery.updateOne(
        { "beds._id": id },
        { $set: { "beds.$.enabled": enabledStatus } },
        {
          new: true,
        }
      );
      if (room) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: `Bed ${
            room.beds.find((b) => b._id.toString() === id)?.enabled === true
              ? "enabled"
              : "disabled"
          } successfully!`,
          result: room,
        });
      } else {
        return common.failureResponse({
          message: "Bed not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
