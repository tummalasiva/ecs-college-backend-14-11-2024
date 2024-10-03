const LabBatch = require("./model");

module.exports = class LabBatchData {
  static async create(data) {
    try {
      const result = await new LabBatch(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await LabBatch.find(filter)
        .populate("students academicYear degreeCode semester")
        .populate("faculty", "academicInfo basicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await LabBatch.findOne(filter)
        .populate("students academicYear degreeCode semester")
        .populate("faculty", "academicInfo basicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await LabBatch.findOneAndUpdate(filter, data, {
        new: true,
        ...options,
      })
        .populate("students academicYear degreeCode semester")
        .populate("faculty", "academicInfo basicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await LabBatch.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
