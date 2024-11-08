const MyQuestionBank = require("./model");

module.exports = class MyQuestionBankData {
  static async create(data) {
    try {
      const result = await new MyQuestionBank(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await MyQuestionBank.find(filter)
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
      const result = await MyQuestionBank.findOne(filter)
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
      const result = await MyQuestionBank.findOneAndUpdate(filter, data, {
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
      const result = await MyQuestionBank.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
