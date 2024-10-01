const ExamTitle = require("./model");

module.exports = class ExamTitleData {
  static async create(data) {
    try {
      const result = await new ExamTitle(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await ExamTitle.find(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await ExamTitle.findOne(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const result = await ExamTitle.findOneAndUpdate(filter, data, {
        new: true,
      }).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await ExamTitle.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
