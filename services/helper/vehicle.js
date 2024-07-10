const vehicleQuery = require("@db/transport/vehicle/queries");
const employeeQuery = require("@db/employee/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");

module.exports = class VehicleService {
  static async create(body) {
    const { driver } = body;

    try {
      let employeeExists = await employeeQuery.findOne({ _id: driver });
      if (!employeeExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Driver not found!",
        });

      if (employeeExists.role.name.toLowerCase() !== "driver") {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
          message: "Given employee is not a driver!",
        });
      }

      let vehicleWithGivenVehicleNumber = await vehicleQuery.findOne({
        number: { $regex: new RegExp(`^${body.number}$`, "i") },
      });
      if (vehicleWithGivenVehicleNumber) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
          message: "Vehicle with the given vehicle number already exists!",
        });
      }
      const newVehicle = await vehicleQuery.create(body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Vehicle added successfully",
        result: newVehicle,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    try {
      let vehicleList = await vehicleQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: vehicleList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { id } = req.params;
      const { driver, number } = req.body;

      let employeeExists = await employeeQuery.findOne({ _id: driver });
      if (!employeeExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Driver not found!",
        });

      if (employeeExists.role.name.toLowerCase() !== "driver") {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
          message: "Given employee is not a driver!",
        });
      }

      let vehicleWithGivenVehicleNumber = await vehicleQuery.findOne({
        number: { $regex: new RegExp(`^${number}$`, "i") },
        _id: { $ne: id },
      });

      if (vehicleWithGivenVehicleNumber)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
          message: "Vehicle with the given vehicle number already exists!",
        });

      let updatedvehicle = await vehicleQuery.updateOne({ _id: id }, req.body, {
        new: true,
      });

      if (!updatedvehicle) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Vehicle not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Vehicle updated successfully!",
        result: updatedvehicle,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      await vehicleQuery.delete({
        _id: id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Vehicle removed successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let vehicle = await vehicleQuery.findOne({ _id: id });

      if (vehicle) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Vehicle fetched successfully",
          result: vehicle,
        });
      } else {
        return common.failureResponse({
          message: "Failed to find the Vehicle details",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
