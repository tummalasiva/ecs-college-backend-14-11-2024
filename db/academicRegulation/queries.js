const AcademicRegulation = require("./model");

module.exports = class AcademicRegulationData {
  static async create(data) {
    try {
      const result = await new AcademicRegulation(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await AcademicRegulation.find(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await AcademicRegulation.findOne(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const result = await AcademicRegulation.findOneAndUpdate(filter, data, {
        new: true,
      }).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await AcademicRegulation.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
