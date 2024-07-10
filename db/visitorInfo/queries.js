const VisitorInfo = require("./model");

module.exports = class VisitorInfoData {
  static async create(data) {
    try {
      const result = await new VisitorInfo(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await VisitorInfo.findOne(filter, projection)
        .populate("school class section toMeetUserType toMeetUser enteredBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await VisitorInfo.findOneAndUpdate(filter, update, options)
        .populate("school class section toMeetUserType toMeetUser enteredBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await VisitorInfo.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await VisitorInfo.find(filter)
        .sort({ createdAt: -1 })
        .populate("school class section toMeetUserType toMeetUser enteredBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await VisitorInfo.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
