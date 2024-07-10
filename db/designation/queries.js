const Designation = require("./model");

module.exports = class DesignationData {
  static async create(data) {
    try {
      const result = await new Designation(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter, projection = {}) {
    try {
      const result = await Designation.findOne(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update, options = {}) {
    try {
      const result = await Designation.findOneAndUpdate(
        filter,
        update,
        options
      ).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Designation.find({
        ...filter,
        name: { $ne: "SUPER ADMIN" },
      })
        .sort({ orderSequence: 1 })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter = {}) {
    try {
      return await Designation.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
