const Achievement = require("./model");

module.exports = class AchievementData {
  static async create(data) {
    try {
      const result = await new Achievement(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Achievement.find(filter)
        .populate("createdBy", "basicInfo academicInfo userType")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await Achievement.findOne(filter)
        .populate("createdBy", "basicInfo academicInfo userType")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const result = await Achievement.findOneAndUpdate(filter, data, {
        new: true,
      })
        .populate("createdBy", "basicInfo academicInfo userType")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Achievement.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
