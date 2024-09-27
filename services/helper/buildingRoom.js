const buildingRoomQueries = require("@db/buildingRoom/queries");
const common = require("@constants/common");
const httpStatusCode = require("@generics/http-status");

module.exports = class BuildingRoomService {
  static async create(req) {
    try {
      const {
        buildingId,
        roomNumber,
        capacity,
        roomType,
        isExamHall,
        numberOfRows,
        numberOfColumns,
      } = req.body;
      let buildingRoomExists = await buildingRoomQueries.findOne({
        building: buildingId,
        roomNumber,
        roomType,
      });
      if (buildingRoomExists)
        return common.failureResponse({
          message: "Building room with the given details already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let newBuildingRoom = await buildingRoomQueries.create({
        building: buildingId,
        roomNumber,
        capacity,
        isExamHall,
        roomType,
        numberOfRows: isExamHall ? numberOfRows : 0,
        numberOfColumns: isExamHall ? numberOfColumns : 0,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Building room added successfully!",
        result: newBuildingRoom,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };

      const result = await buildingRoomQueries.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Building rooms fetched successfully",
        result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await buildingRoomQueries.delete({ _id: req.params.id });
      return common.successResponse({
        message: "Building room deleted successfully!",
        statusCode: httpStatusCode.ok,
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const {
        buildingId,
        roomNumber,
        capacity,
        roomType,
        isExamHall,
        numberOfColumns,
        numberOfRows,
      } = req.body;
      let buildingRoomExists = await buildingRoomQueries.findOne({
        _id: req.params.id,
      });
      if (!buildingRoomExists)
        return common.failureResponse({
          message: "Building room not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      // let updatedBuildingRoom = await buildingRoomQueries.findOneAndUpdate(
      let updatedBuildingRoom = await buildingRoomQueries.updateOne(
        { _id: req.params.id },
        {
          building: buildingId,
          roomNumber,
          capacity,
          isExamHall,
          roomType,
          numberOfRows: isExamHall ? numberOfRows : 0,
          numberOfColumns: isExamHall ? numberOfColumns : 0,
        },
        { new: true }
      );
      return common.successResponse({
        result: updatedBuildingRoom,
        message: "Building room updated successfully!",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async toggleAvailableStatus(req) {
    try {
      let buildingRoomExists = await buildingRoomQueries.findOne({
        _id: req.params.id,
      });
      if (!buildingRoomExists)
        return common.failureResponse({
          message: "Building room not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      // let updatedBuildingRoom = await buildingRoomQueries.findOneAndUpdate(
      let updatedBuildingRoom = await buildingRoomQueries.updateOne(
        { _id: req.params.id },
        { available: !buildingRoomExists.available },
        { new: true }
      );
      return common.successResponse({
        result: updatedBuildingRoom,
        message: "Building room's availability status updated successfully!",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }
};
