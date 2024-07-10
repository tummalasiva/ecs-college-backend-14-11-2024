const SchoolSession = require("./model");

module.exports = class SchoolSessionData {
  static async create(data) {
    try {
      const result = await new SchoolSession(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await SchoolSession.findOne(filter, projection).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await SchoolSession.findOneAndUpdate(
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
      const result = await SchoolSession.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await SchoolSession.find(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await SchoolSession.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
