const Item = require("./model");

module.exports = class ItemData {
  static async create(data) {
    try {
      const result = await new Item(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Item.findOneAndUpdate(filter, data, {
        ...options,
        new: true,
      })
        .populate("school department addedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Item.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await Item.findOne(filter)
        .populate("school department addedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Item.find(filter)
        .populate("school department addedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
