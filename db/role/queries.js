const Role = require("./model");

module.exports = class RoleData {
  static async create(data) {
    try {
      const result = await new Role(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter, projection = {}) {
    try {
      const result = await Role.findOne(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update, options = {}) {
    try {
      const result = await Role.findOneAndUpdate(
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
      const result = await Role.find({
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
      return await Role.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
