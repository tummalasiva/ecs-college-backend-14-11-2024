const Task = require("./model");

module.exports = class TaskData {
  static async create(data) {
    try {
      const result = await new Task(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter, projection = {}) {
    try {
      const result = await Task.findOne(filter, projection)
        .populate("school assignedTo")

        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update, options = {}) {
    try {
      const result = await Task.findOneAndUpdate(filter, update, options)
        .populate("school assignedTo")

        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const res = await Task.find(filter)
        .sort({ dueDate: 1 })
        .populate("school assignedTo")
        .lean();
      return res;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Task.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
