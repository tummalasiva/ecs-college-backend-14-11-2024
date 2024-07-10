const vehicleQuery = require("@db/transport/vehicle/queries");
const httpStatusCode = require("@generics/http-status");
const stopQuery = require("@db/transport/stop/queries");
const routeQuery = require("@db/transport/route/queries");
const common = require("../../constants/common");

module.exports = class RouteService {
  static async create(body) {
    let { vehicle, stops, title } = body;

    try {
      let vehicleExists = await vehicleQuery.findOne({ _id: vehicle });
      if (!vehicleExists) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Vehicle not found!",
        });
      }

      let routeWithTitleExists = await routeQuery.findOne({
        title: { $regex: new RegExp(`^${title}$`, "i") },
      });
      if (routeWithTitleExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Route with the given title already exists!",
          responseCode: "CLIENT_ERROR",
        });

      let newStops = await stopQuery.insertMany(stops);
      let stopIds = newStops.map((s) => s._id);

      body.stops = stopIds;

      let route = await routeQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Route added successfully",
        result: route,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    try {
      let routeList = await routeQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: routeList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { id } = req.params;
      let { vehicle, title } = req.body;

      delete req.body.stops;

      let vehicleExists = await vehicleQuery.findOne({ _id: vehicle });
      if (!vehicleExists) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Vehicle not found!",
        });
      }

      let routeWithTitleExists = await routeQuery.findOne({
        title: { $regex: new RegExp(`^${title}$`, "i") },
        _id: { $ne: id },
      });
      if (routeWithTitleExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Route with the given title already exists!",
          responseCode: "CLIENT_ERROR",
        });

      let updatedRoute = await routeQuery.updateOne({ _id: id }, req.body, {
        new: true,
      });

      if (!updatedRoute) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Route not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Route updated successfully!",
        result: updatedRoute,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      await routeQuery.delete({
        _id: id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Route deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let route = await routeQuery.findOne({ _id: id });

      if (route) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Route fetched successfully",
          result: route,
        });
      } else {
        return common.failureResponse({
          message: "Failed to find the Route details",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async addStop(req) {
    let routeId = req.params.id;
    const { stop } = req.body;

    try {
      let routeWithGivenId = await routeQuery.findOne({ _id: routeId });
      if (!routeWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Route not found!",
          responseCode: "CLIENT_ERROR",
        });

      let newStop = await stopQuery.create(stop);

      let updatedRoute = await routeQuery.updateOne(
        { _id: routeId },
        { $push: { stops: newStop._id } },
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Stop added successfully!",
        result: updatedRoute,
      });
    } catch (error) {
      throw error;
    }
  }

  static async removeStop(req) {
    let stopId = req.params.id;
    try {
      let updatedRoute = await routeQuery.updateOne(
        { "stops._id": stopId },
        { $pull: { stops: { _id: stopId } } },
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Stop removed successfully!",
        result: updatedRoute,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateStop(req) {
    let stopId = req.params.id;
    try {
      let updatedRoute = await routeQuery.updateOne(
        { "stops._id": stopId },
        { $set: { "stops.$": req.body } },
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Stop updated successfully!",
        result: updatedRoute,
      });
    } catch (error) {
      throw error;
    }
  }
};
