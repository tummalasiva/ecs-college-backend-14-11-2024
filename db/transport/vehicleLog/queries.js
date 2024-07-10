const VehicleLog = require("./model");

module.exports = class VehicleLogData {
  static async create(data) {
    try {
      const result = await new VehicleLog(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await VehicleLog.findOne(filter, projection)
        .populate("vehicle route createdBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}, projection) {
    try {
      const result = await VehicleLog.find(filter, projection)
        .populate("vehicle route createdBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await VehicleLog.findOneAndUpdate(filter, update, options)
        .populate("vehicle route createdBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await VehicleLog.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter) {
    try {
      const result = await VehicleLog.findOneAndDelete(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
