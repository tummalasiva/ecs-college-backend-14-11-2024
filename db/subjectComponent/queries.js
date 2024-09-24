const SubjectComponent = require("model");

module.exports = class SubjectComponentData {
  static async create(data) {
    try {
      const result = await new SubjectComponent(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await SubjectComponent.find(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await SubjectComponent.findOne(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData) {
    try {
      const result = await SubjectComponent.findOneAndUpdate(
        filter,
        updateData,
        { new: true }
      ).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await SubjectComponent.deleteOne(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
