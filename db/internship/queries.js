const Internship = require("./model");

module.exports = class InternshipData {
  static async create(data) {
    try {
      const result = await new Internship(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Internship.find(filter)
        .populate({
          path: "appliedBy",
          select: "academicInfo basicInfo",
          populate: [
            { path: "academicInfo.degreeCode" },
            { path: "academicInfo.semester" },
            { path: "academicInfo.section" },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Internship.findOne(filter)
        .populate({
          path: "appliedBy",
          select: "academicInfo basicInfo",
          populate: [
            { path: "academicInfo.degreeCode" },
            { path: "academicInfo.semester" },
            { path: "academicInfo.section" },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Internship.findOneAndUpdate(filter, data, {
        new: true,
        ...options,
      })
        .populate({
          path: "appliedBy",
          select: "academicInfo basicInfo",
          populate: [
            { path: "academicInfo.degreeCode" },
            { path: "academicInfo.semester" },
            { path: "academicInfo.section" },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await Internship.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
