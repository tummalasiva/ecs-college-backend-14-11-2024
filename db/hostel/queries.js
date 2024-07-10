const Hostel = require("./model");

module.exports = class HostelData {
  static async create(data) {
    try {
      const result = await new Hostel(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Hostel.find(filter).populate("warden").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Hostel.findOne(filter).populate("warden").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Hostel.findOneAndUpdate(filter, data, options)
        .populate("warden")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await Hostel.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
