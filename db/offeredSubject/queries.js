const OfferedSubject = require("./model");

module.exports = class OfferedSubjectData {
  static async create(data) {
    try {
      const result = await new OfferedSubject(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await OfferedSubject.find(filter)
        .populate("degreeCode semester academicYear")
        .populate({ path: "subjects", model: "Subject" })
        .populate("registeredStudents", "academicInfo basicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await OfferedSubject.findOne(filter)
        .populate("degreeCode semester academicYear")
        .populate({ path: "subjects", model: "Subject" })
        .populate("registeredStudents", "academicInfo basicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData, options = {}) {
    try {
      const result = await OfferedSubject.findOneAndUpdate(filter, updateData, {
        new: true,
        ...options,
      })
        .populate("degreeCode semester academicYear")
        .populate({ path: "subjects", model: "Subject" })
        .populate("registeredStudents", "academicInfo basicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await OfferedSubject.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
