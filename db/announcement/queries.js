const Announcement = require("./model");

module.exports = class AnnouncementData {
  static async create(data) {
    try {
      const result = await new Announcement(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Announcement.find(filter)
        .populate("createdBy", "basicInfo academicInfo")
        .populate("departmentOfCreator")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await Announcement.findOne(filter)
        .populate("createdBy", "basicInfo academicInfo")
        .populate("departmentOfCreator")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const result = await Announcement.findOneAndUpdate(filter, data, {
        new: true,
      })
        .populate("createdBy", "basicInfo academicInfo")
        .populate("departmentOfCreator")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Announcement.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
