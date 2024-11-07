const ProctorMessage = require("./model");

module.exports = class ProctorMessageData {
  static async create(data) {
    try {
      const result = await new ProctorMessage(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await ProctorMessage.find(filter)
        .populate("createdBy", "basicInfo.name")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await ProctorMessage.findOne(filter)
        .populate("createdBy", "basicInfo.name")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData) {
    try {
      const result = await ProctorMessage.findOneAndUpdate(filter, updateData, {
        new: true,
      })
        .populate("createdBy", "basicInfo.name")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await ProctorMessage.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
