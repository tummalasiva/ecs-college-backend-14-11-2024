const Degree = require("./model");

module.exports = class DegreeData {
  static async create(data) {
    try {
      const result = await new Degree(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const degrees = await Degree.find(filter);
      return degrees;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const degree = await Degree.findOne(filter);
      return degree;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const degree = await Degree.findOneAndUpdate(filter, data, {
        new: true,
      });
      return degree;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const degree = await Degree.findOneAndDelete(filter);
      return degree;
    } catch (error) {
      throw error;
    }
  }
};
