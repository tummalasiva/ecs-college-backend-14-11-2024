const ReceiptTitle = require("./model");

module.exports = class ReceiptTitleData {
  static async create(data) {
    try {
      const result = await new ReceiptTitle(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await ReceiptTitle.find(filter).populate("createdBy");
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await ReceiptTitle.findOne(filter, projection).populate(
        "createdBy"
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, data, options = {}) {
    try {
      const result = await ReceiptTitle.findOneAndUpdate(
        filter,
        data,
        options
      ).populate("createdBy");
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, data, options = {}) {
    try {
      const result = await ReceiptTitle.updateMany(filter, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await ReceiptTitle.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
