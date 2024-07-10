const Room = require("./model");

module.exports = class RoomData {
  static async create(data) {
    try {
      const result = await new Room(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Room.find(filter).populate("hostel type").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Room.findOne(filter).populate("hostel type").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Room.findOneAndUpdate(filter, data, options)
        .populate("hostel type")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await Room.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
