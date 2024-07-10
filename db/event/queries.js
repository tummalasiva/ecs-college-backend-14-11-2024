const EventModal = require("./model");

module.exports = class EventData {
  static async create(data) {
    try {
      console.log(data, "datatatatataatatatat");
      const result = await new EventModal(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await EventModal.findOne(filter, projection)
        .populate("school")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await EventModal.findOneAndUpdate(filter, update, options)
        .populate("school")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await EventModal.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await EventModal.find(filter)
        .sort({ createdAt: -1 })
        .populate("school")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await EventModal.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
