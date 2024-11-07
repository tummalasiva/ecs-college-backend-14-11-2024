const Scholarship = require("./model");

module.exports = class ScholarshipData {
  static async create(data) {
    try {
      const result = await new Scholarship(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Scholarship.find(filter)
        .populate("student", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await Scholarship.findOne(filter)
        .populate("student", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update) {
    try {
      const result = await Scholarship.findOneAndUpdate(filter, update, {
        new: true,
      })
        .populate("student", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Scholarship.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
