const RoomType = require("./model");

module.exports = class RoomTypeData {
  static async create(data) {
    try {
      const result = await new RoomType(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await RoomType.find(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await RoomType.findOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await RoomType.findOneAndUpdate(filter, data, options);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await RoomType.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
