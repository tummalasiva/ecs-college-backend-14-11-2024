const Firm = require("./model");

module.exports = class FirmData {
  static async create(data) {
    try {
      const result = await new Firm(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findOne(filter = {}, projection) {
    try {
      const result = await Firm.findOne(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}, projection) {
    try {
      const result = await Firm.find(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async updateOne(filter = {}, data = {}, options = {}) {
    try {
      const result = await Firm.findOneAndUpdate(filter, data, options).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter = {}) {
    try {
      const result = await Firm.findOneAndDelete(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
