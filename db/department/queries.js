const Department = require("./model");

module.exports = class DepartmentData {
  static async create(data) {
    try {
      const result = await new Department(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter, projection = {}) {
    try {
      const result = await Department.findOne(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update, options = {}) {
    try {
      const result = await Department.findOneAndUpdate(
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
      const result = await Department.find({
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
      return await Department.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
