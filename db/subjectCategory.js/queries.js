const SubjectCategory = require("./model");

module.exports = class SubjectCategoryData {
  static async create(data) {
    try {
      const result = await new SubjectCategory(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await SubjectCategory.find(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await SubjectCategory.findOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const result = await SubjectCategory.findOneAndUpdate(filter, data, {
        new: true,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await SubjectCategory.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
