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
        .populate("subject")
        .populate({
          path: "createdBy",
          select: "academicInfo basicInfo",
          populate: [
            {
              path: "academicInfo.department",
            },
            {
              path: "basicInfo.designation",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await SavedQuestion.findOne(filter)
        .populate("subject")
        .populate({
          path: "createdBy",
          select: "academicInfo basicInfo",
          populate: [
            {
              path: "academicInfo.department",
            },
            {
              path: "basicInfo.designation",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, data, options = {}) {
    try {
      const result = await SavedQuestion.findOneAndUpdate(filter, data, {
        new: true,
        ...options,
      })
        .populate("subject")
        .populate({
          path: "createdBy",
          select: "academicInfo basicInfo",
          populate: [
            {
              path: "academicInfo.department",
            },
            {
              path: "basicInfo.designation",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await SavedQuestion.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
