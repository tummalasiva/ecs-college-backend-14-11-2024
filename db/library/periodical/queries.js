const Periodical = require("./model");

module.exports = class PeriodicalData {
  static async create(data) {
    try {
      const result = await new Periodical(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Periodical.find(filter).populate("school").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Periodical.findOne(filter).populate("school").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Periodical.findOneAndUpdate(filter, data, options)
        .populate("school")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await Periodical.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
