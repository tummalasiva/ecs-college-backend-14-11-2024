const Book = require("./model");

module.exports = class BookData {
  static async create(data) {
    try {
      const result = await new Book(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Book.find(filter).populate("school").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Book.findOne(filter).populate("school").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Book.findOneAndUpdate(filter, data, options)
        .populate("school")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await Book.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
