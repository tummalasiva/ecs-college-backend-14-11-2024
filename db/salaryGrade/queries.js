const SalaryGrade = require("./model");

module.exports = class SalaryGradeData {
  static async create(data) {
    try {
      const result = await new SalaryGrade(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findOne(filter = {}, projection) {
    try {
      const result = await SalaryGrade.findOne(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}, projection) {
    try {
      const result = await SalaryGrade.find(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async updateOne(filter, data, options = {}) {
    try {
      const result = await SalaryGrade.findOneAndUpdate(
        filter,
        data,
        options
      ).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter) {
    try {
      const result = await SalaryGrade.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
