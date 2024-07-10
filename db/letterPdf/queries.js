const letterPdfModel = require("./model");

module.exports = class LetterPdfClass {
  static async exists(filter) {
    try {
      const result = await letterPdfModel.exists(filter);
      return result;
    } catch (error) {
      return error;
    }
  }

  static async create(data) {
    try {
      const result = await new letterPdfModel(data).save();
      return result;
    } catch (error) {
      return error;
    }
  }

  static async list(search, limit, page) {
    try {
      const result = await letterPdfModel
        .find(search)
        .limit(parseInt(limit))
        .skip((page - 1) * limit)
        .select("-data.signImg -data.logo")
        .lean()
        .exec();
      return result;
    } catch (error) {
      return error;
    }
  }

  static async findById(id) {
    try {
      const result = await letterPdfModel.findById(id);
      return result;
    } catch (error) {
      return error;
    }
  }

  static async updateById(id, update, options = {}) {
    try {
      const result = await letterPdfModel.findByIdAndUpdate(
        id,
        update,
        options
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  static async deleteById(id) {
    try {
      const result = await letterPdfModel.findByIdAndDelete(id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
