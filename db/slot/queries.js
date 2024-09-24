const Slot = require("./model");

module.exports = class SlotData {
  static async create(data) {
    try {
      const result = await new Slot(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const slots = await Slot.find(filter).lean();
      return slots;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const slot = await Slot.findOne(filter).lean();
      return slot;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData) {
    try {
      const slot = await Slot.findOneAndUpdate(filter, updateData, {
        new: true,
      }).lean();
      return slot;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const slot = await Slot.findOneAndDelete(filter);
      return slot;
    } catch (error) {
      throw error;
    }
  }
};
