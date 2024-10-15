const Publication = require("./model");

module.exports = class PublicationData {
  static async create(data) {
    try {
      const result = await new Publication(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Publication.find(filter)
        .populate("createdBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await Publication.findOne(filter)
        .populate("createdBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const result = await Publication.findOneAndUpdate(filter, data, {
        new: true,
      })
        .populate("createdBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Publication.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
