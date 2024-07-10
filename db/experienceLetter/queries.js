const OfferLetter = require("./model");

module.exports = class OfferLetterData {
  static async create(data) {
    try {
      const result = await new OfferLetter(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await OfferLetter.findOne(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await OfferLetter.findOneAndUpdate(
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
      const result = await OfferLetter.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await OfferLetter.find(filter)
        .sort({ createdAt: -1 })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await OfferLetter.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
