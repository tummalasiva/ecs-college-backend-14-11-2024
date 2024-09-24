const Subject = require("./model");

module.exports = class SubjectData {
  static async create(data) {
    try {
      const result = await Subject(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Subject.findOne(filter, projection)
        .populate("degreeCode subjectType subjectCategory preRequisite")
        .populate({ path: "componentsAndCredits", model: "SubjectComponent" })
        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await Subject.findOneAndUpdate(filter, update, options)
        .populate("degreeCode subjectType subjectCategory preRequisite")
        .populate({ path: "componentsAndCredits", model: "SubjectComponent" })
        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await Subject.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const res = await Subject.find(filter)
        .sort({ name: 1 })

        .populate("degreeCode subjectType subjectCategory preRequisite")
        .populate({ path: "componentsAndCredits", model: "SubjectComponent" })
        .lean();

      return res;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Subject.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
