const Student = require("./model");

module.exports = class NewsData {
  static async create(data) {
    try {
      const result = await new Student(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await Student.findOne(filter, projection)
        .populate(
          "school academicYear academicInfo.section academicInfo.degreeCode"
        )
        .populate({ path: "transportInfo.route", model: "Route" })
        .populate({ path: "transportInfo.stop", model: "Stop" })
        .populate({ path: "transportInfo.vehicle", model: "Vehicle" })
        .populate("hostelInfo.room")
        .populate({ path: "registeredSubjects.subject", model: "Subject" })
        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await Student.findOneAndUpdate(filter, update, options)
        .populate(
          "school academicYear academicInfo.section academicInfo.degreeCode"
        )
        .populate({ path: "transportInfo.route", model: "Route" })
        .populate({ path: "transportInfo.stop", model: "Stop" })
        .populate({ path: "transportInfo.vehicle", model: "Vehicle" })
        .populate("hostelInfo.room")
        .populate({ path: "registeredSubjects.subject", model: "Subject" })

        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const res = await Student.updateMany(filter, update);
      return res;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const res = await Student.find(filter)
        .populate(
          "school academicYear academicInfo.section academicInfo.degreeCode"
        )
        .populate({ path: "transportInfo.route", model: "Route" })
        .populate({ path: "transportInfo.stop", model: "Stop" })
        .populate({ path: "transportInfo.vehicle", model: "Vehicle" })
        .populate("hostelInfo.room")
        .populate({ path: "registeredSubjects.subject", model: "Subject" })

        .lean();

      return res;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Student.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
