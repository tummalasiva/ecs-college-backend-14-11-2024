const SplashNews = require("./model");

module.exports = class SplashNewsData {
  static async create(data) {
    try {
      const result = await new SplashNews(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await SplashNews.findOne(filter, projection)
        .populate("school createdBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await SplashNews.findOneAndUpdate(filter, update, options)
        .populate("school createdBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await SplashNews.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await SplashNews.find(filter)
        .sort({ createdAt: -1 })
        .populate("school createdBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await SplashNews.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
