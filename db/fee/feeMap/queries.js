const { FeeMap } = require("./model");

module.exports = class FeeMapClass {
  static async findOne(filter, projection = {}) {
    try {
      const result = await FeeMap.findOne(filter, projection)
        .populate("school receiptTitle class stop hostel")
        .populate({ path: "route", populate: { path: "vehicle" } })
        .lean();
      return result;
    } catch (error) {
      return error;
    }
  }

  static async create(data) {
    try {
      const result = await new FeeMap(data).save();
      return result;
    } catch (error) {
      return error;
    }
  }

  static async updateOne(filter, update, options = {}) {
    try {
      const result = await FeeMap.findOneAndUpdate(filter, update, options)
        .populate("school receiptTitle class stop hostel")
        .populate({ path: "route", populate: { path: "vehicle" } })
        .lean();
      return result;
    } catch (error) {
      return error;
    }
  }

  static async findAll(filter) {
    try {
      const result = await FeeMap.find(filter)
        .populate("school receiptTitle class stop hostel")
        .populate({ path: "route", populate: { path: "vehicle" } })
        .lean();
      return result;
    } catch (error) {
      return error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await FeeMap.findOneAndDelete((filter = {}));
    } catch (error) {
      return error;
    }
  }
};
