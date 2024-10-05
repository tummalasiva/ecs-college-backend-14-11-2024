const CoPsoMapping = require("./model");

module.exports = class CoPsoMappingData {
  static async create(data) {
    try {
      const result = await new CoPsoMapping(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await CoPsoMapping.findOne(filter, projection)
        .populate("degreeCode subject coId psoId")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async updateOne(filter = {}, update) {
    try {
      const result = await CoPsoMapping.findOneAndUpdate(filter, update)
        .populate("degreeCode subject coId psoId")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter = {}) {
    try {
      const result = await CoPsoMapping.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}) {
    try {
      const result = await CoPsoMapping.find(filter)
        .populate("degreeCode subject coId psoId")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
