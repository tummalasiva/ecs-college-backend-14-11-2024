const Holiday = require("./model");

module.exports = class HolidayData {
  static async create(data) {
    try {
      const result = await new Holiday(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Holiday.findOne(filter, projection)
        .populate("school")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await Holiday.findOneAndUpdate(filter, update, options)
        .populate("school")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await Holiday.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Holiday.find(filter)
        .sort({ createdAt: -1 })
        .populate("school")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Holiday.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
