const CourseContent = require("./model");

module.exports = class CourseContentData {
  static async create(data) {
    try {
      const result = await CourseContent(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await CourseContent.findOne(filter, projection)
        .populate("courseId")
        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await CourseContent.findOneAndUpdate(
        filter,
        update,
        options
      )
        .populate("courseId")
        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await CourseContent.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const res = await CourseContent.find(filter)
        .sort({ createdAt: -1 })
        .populate("courseId")
        .lean();

      return res;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await CourseContent.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
