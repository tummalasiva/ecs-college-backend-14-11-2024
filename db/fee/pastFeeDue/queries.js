const PastFeeDue = require("./model");

module.exports = class PastFeeDueClass {
  static async create(data) {
    try {
      const result = await new PastFeeDue(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection = {}) {
    try {
      const result = await PastFeeDue.findOne(filter, projection)
        .populate("academicYear feeMap receipt collectedBy")

        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}, projection = {}) {
    try {
      const result = await PastFeeDue.find(filter, projection)
        .populate("academicYear feeMap receipt collectedBy")

        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await PastFeeDue.findOneAndUpdate(filter, data, options)
        .populate("academicYear feeMap receipt collectedBy")

        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateMany(filter, data) {
    try {
      const result = await PastFeeDue.updateMany(filter, data);

      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter) {
    try {
      const result = await PastFeeDue.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
