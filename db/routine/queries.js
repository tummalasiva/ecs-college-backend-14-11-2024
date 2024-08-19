const Routine = require("./model");

module.exports = class RoutineData {
  static async create(data) {
    try {
      const result = await new Routine(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Routine.find(filter).populate(
        "school class section subject teacher"
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Routine.findOne(filter).populate(
        "school class section subject teacher"
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData) {
    try {
      const result = await Routine.findOneAndUpdate(filter, updateData, {
        new: true,
      }).populate("school class section subject teacher");
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Routine.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
