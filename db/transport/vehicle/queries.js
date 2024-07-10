const VehicleData = require("./model");

module.exports = class Vehicle {
  static async create(data) {
    try {
      const result = await new VehicleData(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await VehicleData.findOne(filter, projection)
        .populate("driver")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}, projection) {
    try {
      const result = await VehicleData.find(filter, projection)
        .populate("driver")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, data, options = {}) {
    try {
      const result = await VehicleData.findOneAndUpdate(filter, data, options)
        .populate("driver")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await VehicleData.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
