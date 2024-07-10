const ExamTerm = require("./model");

module.exports = class ExamTermData {
  static async create(data) {
    try {
      const result = await new ExamTerm(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await ExamTerm.findOne(filter, projection)
        .populate("school academicYear")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await ExamTerm.findOneAndUpdate(filter, update, options)
        .populate("school academicYear")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await ExamTerm.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await ExamTerm.find(filter)
        .sort({ createdAt: -1 })
        .populate("school academicYear")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await ExamTerm.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
