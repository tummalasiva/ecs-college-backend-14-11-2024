const StudentCheckout = require("./model");

module.exports = class StudentCheckouttData {
  static async create(data) {
    try {
      const result = await StudentCheckout(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await StudentCheckout.findOne(filter, projection)
        .populate("school student")
        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await StudentCheckout.findOneAndUpdate(
        filter,
        update,
        options
      )
        .populate("school student")

        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await StudentCheckout.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const res = await StudentCheckout.find(filter)
        .sort({ createdAt: -1 })
        .populate("school student")

        .lean();

      return res;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await StudentCheckout.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
