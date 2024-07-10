const Route = require("./model");

module.exports = class RouteData {
  static async create(data) {
    try {
      const result = await new Route(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Route.find(filter)
        .populate("vehicle")
        .populate({ path: "stops", model: "Stop" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Route.findOne(filter)
        .populate("vehicle")
        .populate({ path: "stops", model: "Stop" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Route.findOneAndUpdate(filter, data, options)
        .populate("vehicle")
        .populate({ path: "stops", model: "Stop" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await Route.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
