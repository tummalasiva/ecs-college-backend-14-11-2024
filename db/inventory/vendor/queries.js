const Vendor = require("./model");

module.exports = class VendorData {
  static async create(data) {
    try {
      const result = await new Vendor(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Vendor.findOne(filter)
        .populate("school addedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Vendor.findOneAndUpdate(filter, data, {
        ...options,
        new: true,
      })
        .populate("school addedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Vendor.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter) {
    try {
      const result = await Vendor.find(filter)
        .populate("school addedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
