const WishlistDeclaration = require("./model");

module.exports = class WishlistDeclarationData {
  static async create(data) {
    try {
      const result = await new WishlistDeclaration(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await WishlistDeclaration.findOne(filter)
        .populate("department semester subjectCategories")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await WishlistDeclaration.find(filter)
        .populate("department semester subjectCategories")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updates) {
    try {
      const result = await WishlistDeclaration.findOneAndUpdate(
        filter,
        updates,
        {
          new: true,
        }
      )
        .populate("department semester subjectCategories")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await WishlistDeclaration.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
