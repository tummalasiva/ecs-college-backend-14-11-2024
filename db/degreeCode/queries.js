const DegreeCode = require("./model");

module.exports = class DegreeCodeData {
  static async create(data) {
    try {
      const degreeCode = await new DegreeCode(data).save();
      return degreeCode;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const degreeCodes = await DegreeCode.find(filter)
        .populate("degree")
        .lean();
      return degreeCodes;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const degreeCode = await DegreeCode.findOne(filter)
        .populate("degree")
        .lean();
      return degreeCode;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const updatedDegreeCode = await DegreeCode.findOneAndUpdate(
        filter,
        data,
        { new: true }
      )
        .populate("degree")
        .lean();
      return updatedDegreeCode;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      await DegreeCode.deleteOne(filter);
    } catch (error) {
      throw error;
    }
  }
};
