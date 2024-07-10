const Section = require("./model");

module.exports = class SectionData {
  static async create(data) {
    try {
      const result = await Section(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Section.findOne(filter, projection)
        .populate({
          path: "school",
          model: "School",
        })
        .populate({
          path: "class",
          model: "Class",
        })
        .populate({
          path: "sectionTeacher",
          model: "Employee",
        })
        .lean();

      if (result) {
        if (!result.class) {
          result.class = result.fallbackClass;
        }
        delete result.fallbackClass;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await Section.findOneAndUpdate(filter, update, options)
        .populate({
          path: "school",
          model: "School",
        })
        .populate({
          path: "class",
          model: "Class",
        })
        .populate({
          path: "sectionTeacher",
          model: "Employee",
        })
        .lean();

      if (result) {
        if (!result.class) {
          result.class = result.fallbackClass;
        }
        delete result.fallbackClass;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await Section.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Section.find(filter)
        .sort({ orderSequence: 1 })
        .populate({
          path: "school",
          model: "School",
        })
        .populate({
          path: "class",
          model: "Class",
        })
        .populate({
          path: "sectionTeacher",
          model: "Employee",
        })
        .lean();

      let finalList = [];
      for (let section of result) {
        if (!section.class) {
          section.class = section.fallbackClass;
        }
        delete section.fallbackClass;
        finalList.push(section);
      }
      return finalList;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Section.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
