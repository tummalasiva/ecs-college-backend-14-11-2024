const SubjectType = require("./model");

module.exports = class SubjectTypeData {
  static async create(data) {
    try {
      const result = await new SubjectType(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await SubjectType.find(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await SubjectType.findOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const result = await SubjectType.findOneAndUpdate(filter, data, {
        new: true,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await SubjectType.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
