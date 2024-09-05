const Building = require("./model");

module.exports = class BuildingData {
  static async create(data) {
    try {
      const result = await new Building(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const buildings = await Building.find(filter);
      return buildings;
    } catch (error) {
      throw error;
    }
  }
  static async findOne(filter = {}) {
    try {
      const building = await Building.findOne(filter);
      return building;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update) {
    try {
      const building = await Building.findOneAndUpdate(filter, update, {
        new: true,
      });
      return building;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Building.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
