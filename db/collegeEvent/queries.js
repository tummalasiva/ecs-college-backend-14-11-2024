const CollegeEvent = require("./model");

module.exports = class CollegeEventData {
  static async create(data) {
    try {
      const result = await new CollegeEvent(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await CollegeEvent.find(filter)
        .populate("createdBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await CollegeEvent.findOne(filter)
        .populate("createdBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const result = await CollegeEvent.findOneAndUpdate(filter, data, {
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
      const result = await CollegeEvent.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
