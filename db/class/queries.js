const Class = require("./model");

module.exports = class ClassData {
  static async create(data) {
    try {
      const result = await Class(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Class.findOne(filter, projection)
        .populate({
          path: "school",
          model: "School",
        })
        .populate({
          path: "classTeachers",
          model: "Employee",
          match: { active: true }, // Only include active employees
        })
        .lean();

      if (result) {
        if (!result.school) {
          result.school = result.fallbackSchool;
        }
        delete result.fallbackSchool;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await Class.findOneAndUpdate(filter, update, options)
        .populate({
          path: "school",
          model: "School",
        })
        .populate({
          path: "classTeachers",
          model: "Employee",
          match: { active: true }, // Only include active employees
        })
        .lean();

      if (result) {
        if (!result.school) {
          result.school = result.fallbackSchool;
        }
        delete result.fallbackSchool;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await Class.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Class.find(filter)
        .sort({ orderSequence: 1 })
        .populate({
          path: "school",
          model: "School",
        })
        .populate({
          path: "classTeachers",
          model: "Employee",
          match: { active: true }, // Only include active employees
        })
        .lean();

      let finalList = [];
      for (let cls of result) {
        if (!cls.school) {
          cls.school = cls.fallbackSchool;
        }
        delete cls.fallbackSchool;
        finalList.push(cls);
      }
      return finalList;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Class.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
