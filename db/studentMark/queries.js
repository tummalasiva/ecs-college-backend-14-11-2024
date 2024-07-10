const StudentMark = require("./model");

module.exports = class StudentMarkData {
  static async create(data) {
    try {
      const result = await new StudentMark(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async insertMany(data) {
    try {
      const result = await StudentMark.insertMany(data);
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findOne(filter, projection = {}) {
    try {
      const result = await StudentMark.findOne(filter, projection)
        .populate("school grade")
        .populate({
          path: "student",
          populate: [
            { path: "academicInfo.class", model: "Class" },
            { path: "academicInfo.section", model: "Section" },
          ],
        })
        .populate({
          path: "examSchedule",
          populate: [
            {
              path: "subject",
              model: "Subject",
            },
            {
              path: "class",
              model: "Class",
            },
            {
              path: "examTerm",
              model: "ExamTerm",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}, projection = {}) {
    try {
      const result = await StudentMark.find(filter, projection)
        .populate("school grade")
        .populate({
          path: "student",
          populate: [
            { path: "academicInfo.class", model: "Class" },
            { path: "academicInfo.section", model: "Section" },
          ],
        })
        .populate({
          path: "examSchedule",
          populate: [
            {
              path: "subject",
              model: "Subject",
            },
            {
              path: "class",
              model: "Class",
            },
            {
              path: "examTerm",
              model: "ExamTerm",
            },
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
      const result = await StudentMark.findOneAndUpdate(filter, data, options)
        .populate("school grade")
        .populate({
          path: "student",
          populate: [
            { path: "academicInfo.class", model: "Class" },
            { path: "academicInfo.section", model: "Section" },
          ],
        })
        .populate({
          path: "examSchedule",
          populate: [
            {
              path: "subject",
              model: "Subject",
            },
            {
              path: "class",
              model: "Class",
            },
            {
              path: "examTerm",
              model: "ExamTerm",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async updateList(filter = {}, update) {
    try {
      const result = await StudentMark.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter) {
    try {
      const result = await StudentMark.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async bulkWrite(bulkOps, options) {
    try {
      const result = await StudentMark.bulkWrite(bulkOps, options);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
