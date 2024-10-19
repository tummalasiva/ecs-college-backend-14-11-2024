const ExamSchedule = require("./model");

module.exports = class ExamScheduleData {
  static async create(data) {
    try {
      const result = await new ExamSchedule(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await ExamSchedule.findOne(filter, projection)
        .populate("slot")
        .populate({
          path: "cieExam",
          populate: [
            { path: "examTitle", model: "ExamTitle" },
            { path: "section", model: "Section" },
            { path: "subject", model: "Subject" },
            { path: "semester", model: "Semester" },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await ExamSchedule.findOneAndUpdate(
        filter,
        update,
        options
      )
        .populate("slot")
        .populate({
          path: "cieExam",
          populate: [
            { path: "examTitle", model: "ExamTitle" },
            { path: "section", model: "Section" },
            { path: "subject", model: "Subject" },
            { path: "semester", model: "Semester" },
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
      const result = await ExamSchedule.updateMany(filter, update);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await ExamSchedule.find(filter)

        .populate("slot")
        .populate({
          path: "cieExam",
          populate: [
            { path: "examTitle", model: "ExamTitle" },
            { path: "section", model: "Section" },
            { path: "subject", model: "Subject" },
            { path: "semester", model: "Semester" },
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
      return await ExamSchedule.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
