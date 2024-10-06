const schoolQuery = require("@db/school/queries");
const seatQuery = require("@db/seat/queries");
const Seat = require("@db/seat/model");
const buildingRoomQuery = require("@db/buildingRoom/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { generateSeats } = require("../../helper/helpers");

module.exports = class SeatHelper {
  static async create(req) {
    try {
      const { room } = req.body;
      const roomExists = await buildingRoomQuery.findOne({ _id: room });
      if (!roomExists)
        return common.failureResponse({
          message: "Room not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      let seatsExist = await seatQuery.findAll({ room: room });
      if (seatsExist.length)
        return common.failureResponse({
          message: "Seats already created for this room!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      if (!roomExists.isExamHall)
        return common.failureResponse({
          message: "Only exam hall rooms can be seated!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let numberOfRows = roomExists.numberOfRows;
      let numberOfColumns = roomExists.numberOfColumns;

      const seats = generateSeats(numberOfRows, numberOfColumns);
      let dataToInsert = [];
      for (let seat of seats) {
        dataToInsert.push({
          name: seat,
          room: roomExists._id,
        });
      }

      await Seat.insertMany(dataToInsert);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Seats created successfully!",
        result: seats,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const result = await seatQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await seatQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Seat deleted successfully!",
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteAll(req) {
    try {
      await seatQuery.deleteMany({ room: req.query.room });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "All seats deleted successfully for the room!",
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }
};
