const Curriculum = require("./model");

module.exports = class CurriculumData {
  static async create(data) {
    try {
      const result = await new Curriculum(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Curriculum.find(filter)
        .populate("degreeCode")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Curriculum.findOne(filter)
        .populate("degreeCode")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Curriculum.findOneAndUpdate(filter, data, {
        new: true,
        ...options,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await Curriculum.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
