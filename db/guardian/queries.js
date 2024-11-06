const Guardian = require("./model");

module.exports = class GuardianData {
  static async create(data) {
    try {
      const result = await new Guardian(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter) {
    try {
      const result = await Guardian.find(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await Guardian.findOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Guardian.findOneAndUpdate(filter, data, {
        new: true,
        ...options,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await Guardian.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
