const BuildingRoom = require("./model");

module.exports = class BuildingRoomData {
  static async create(data) {
    try {
      const result = await new BuildingRoom(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await BuildingRoom.find(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await BuildingRoom.findOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update) {
    try {
      const result = await BuildingRoom.findOneAndUpdate(filter, update, {
        new: true,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await BuildingRoom.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
