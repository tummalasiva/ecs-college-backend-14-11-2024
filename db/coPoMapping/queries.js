const CoPoMapping = require("./model");

module.exports = class CoPoMappingData {
  static async create(data) {
    try {
      const result = await new CoPoMapping(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await CoPoMapping.findOne(filter, projection)
        .populate("degreeCode subject coId poId")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async updateOne(filter = {}, update) {
    try {
      const result = await CoPoMapping.findOneAndUpdate(filter, update)
        .populate("degreeCode subject coId poId")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter = {}) {
    try {
      const result = await CoPoMapping.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}) {
    try {
      const result = await CoPoMapping.find(filter)
        .populate("degreeCode subject coId poId")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
