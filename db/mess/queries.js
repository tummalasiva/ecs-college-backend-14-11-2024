const Mess = require("./model");

module.exports = class MessData {
  static async create(data) {
    try {
      const result = await new Mess(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Mess.find(filter)
        .populate("hostel")
        .populate("incharge", "basicInfo academicInfo")
        .populate("workers", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Mess.findOneAndUpdate(filter, data, options)
        .populate("hostel")
        .populate("incharge", "basicInfo academicInfo")
        .populate("workers", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await Mess.findOne(filter)
        .populate("hostel")
        .populate("incharge", "basicInfo academicInfo")
        .populate("workers", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Mess.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
