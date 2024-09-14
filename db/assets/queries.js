const Asset = require("./model");

module.exports = class AssetData {
  static async create(data) {
    try {
      const result = await new Asset(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Asset.find(filter)
        .populate("building room assignedTo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Asset.findOne(filter)
        .populate("building room assignedTo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData) {
    try {
      const result = await Asset.findOneAndUpdate(filter, updateData, {
        new: true,
      })
        .populate("building room assignedTo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Asset.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
