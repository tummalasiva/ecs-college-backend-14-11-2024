const WishList = require("./model");

module.exports = class WishListData {
  static async create(data) {
    try {
      const result = await new WishList(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const results = await WishList.find(filter)
        .populate("subject semester degreeCode")
        .populate(
          "registerdStudents",
          "basicInfo.name academicInfo.registrationNumber"
        )
        .lean();
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await WishList.findOne(filter)
        .populate("subject semester degreeCode")
        .populate(
          "registerdStudents",
          "basicInfo.name academicInfo.registrationNumber"
        )
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const result = await WishList.findByIdAndUpdate(filter, data, {
        new: true,
      })
        .populate("subject semester degreeCode")
        .populate(
          "registerdStudents",
          "basicInfo.name academicInfo.registrationNumber"
        )
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await WishList.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
