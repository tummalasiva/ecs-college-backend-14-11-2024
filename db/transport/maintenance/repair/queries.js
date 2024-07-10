const Repair = require("./model");

module.exports = class RepairData {
  static async create(data) {
    try {
      const result = await new Repair(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Repair.findOne(filter, projection)
        .populate("vehicle firm")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}, projection = {}) {
    try {
      const result = await Repair.find(filter, projection)
        .populate("vehicle firm")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter = {}) {
    try {
      return await Repair.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
  static async updateOne(filter, data, options = {}) {
    try {
      return await Repair.findOneAndUpdate(filter, data, options)
        .populate("vehicle firm")
        .lean();
    } catch (error) {
      throw error;
    }
  }
};
