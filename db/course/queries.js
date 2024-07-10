const Course = require("./model");

module.exports = class CourseData {
  static async create(data) {
    try {
      const result = await Course(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Course.findOne(filter, projection)
        .populate("school subject createdBy updatedBy")
        .populate({ path: "class", model: "Class" })
        .lean();

      if (result) {
        if (!result.subject) {
          result.subject = result.fallbackSubject;
          delete result.fallbackSubject;
        }

        if (!result.class) {
          result.class = result.fallbackClass;
          delete result.fallbackClass;
        }
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await Course.findOneAndUpdate(filter, update, options)
        .populate("school subject createdBy updatedBy")
        .populate({ path: "class", model: "Class" })
        .lean();

      if (result) {
        if (!result.subject) {
          result.subject = result.fallbackSubject;
          delete result.fallbackSubject;
        }

        if (!result.class) {
          result.class = result.fallbackClass;
          delete result.fallbackClass;
        }
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await Course.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const res = await Course.find(filter)
        .sort({ createdAt: -1 })
        .populate("school subject createdBy updatedBy")
        .populate({ path: "class", model: "Class" })
        .lean();

      let finalList = [];
      for (let result of res) {
        if (!result.subject) {
          result.subject = result.fallbackSubject;
          delete result.fallbackSubject;
        }

        if (!result.class) {
          result.class = result.fallbackClass;
          delete result.fallbackClass;
        }

        finalList.push(result);
      }
      return finalList;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Course.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
