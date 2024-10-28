const MessMenu = require("./model");

module.exports = class MessMenuData {
  static async create(data) {
    try {
      const result = await new MessMenu(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await MessMenu.find(filter)
        .populate("mess")
        .populate("items");
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await MessMenu.findOne(filter)
        .populate("mess")
        .populate("items");
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await MessMenu.findOneAndUpdate(filter, data, options)
        .populate("mess")
        .populate("items");
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await MessMenu.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
