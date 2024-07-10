const Gallery = require("./model");

module.exports = class GalleryData {
  static async create(data) {
    try {
      const result = await new Gallery(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Gallery.findOne(filter, projection)
        .populate("school")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await Gallery.findOneAndUpdate(filter, update, options)
        .populate("school")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await Gallery.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Gallery.find(filter)
        .sort({ createdAt: -1 })
        .populate("school")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Gallery.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
