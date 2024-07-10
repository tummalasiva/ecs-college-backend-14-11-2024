const RelievingLetter = require("./model");

module.exports = class RelievingLetterData {
  static async create(data) {
    try {
      const result = await new RelievingLetter(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await RelievingLetter.findOne(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await RelievingLetter.findOneAndUpdate(
        filter,
        update,
        options
      ).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await RelievingLetter.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await RelievingLetter.find(filter)
        .sort({ createdAt: -1 })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await RelievingLetter.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
