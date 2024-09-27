const SavedQuestion = require("./model");

module.exports = class SavedQuestionData {
  static async create(data) {
    try {
      const result = await new SavedQuestion(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await SavedQuestion.find(filter)
        .populate("coId subject")
        .populate("createdBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await SavedQuestion.findOne(filter)
        .populate("coId subject")
        .populate("createdBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update) {
    try {
      const result = await SavedQuestion.findOneAndUpdate(filter, update, {
        new: true,
      })
        .populate("coId subject")
        .populate("createdBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await SavedQuestion.deleteOne(filter).exec();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
