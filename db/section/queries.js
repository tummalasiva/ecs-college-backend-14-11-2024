const Section = require("./model");

module.exports = class SectionData {
  static async create(data) {
    try {
      const result = await Section(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Section.findOne(filter, projection)
        .populate("degreeCode")
        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await Section.findOneAndUpdate(filter, update, options)
        .populate("degreeCode")
        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await Section.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Section.find(filter).populate("degreeCode").lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Section.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
