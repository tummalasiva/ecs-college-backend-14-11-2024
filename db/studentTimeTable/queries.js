const StudentTimeTable = require("./model");

module.exports = class StudentTimeTableData {
  static async create(data) {
    try {
      const result = await new StudentTimeTable(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await StudentTimeTable.find(filter)
        .populate("degreeCode academicYear building room")
        .populate({ path: "slots", model: "Slot" })
        .populate("faculty")

        .populate({
          path: "batches",
          populate: {
            path: "faculty",
            model: "Employee",
          },
        })
        .populate({
          path: "subject",
          populate: [
            {
              path: "componentsAndCredits.component",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await StudentTimeTable.findOne(filter)
        .populate("degreeCode academicYear building room")
        .populate({ path: "slots", model: "Slot" })
        .populate("faculty")

        .populate({
          path: "batches",
          populate: {
            path: "faculty",
            model: "Employee",
          },
        })
        .populate({
          path: "subject",
          populate: [
            {
              path: "componentsAndCredits.component",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update) {
    try {
      const result = await StudentTimeTable.findOneAndUpdate(filter, update)
        .populate("degreeCode academicYear building room")
        .populate({ path: "slots", model: "Slot" })
        .populate("faculty")
        .populate({
          path: "batches",
          populate: {
            path: "faculty",
            model: "Employee",
          },
        })
        .populate({
          path: "subject",
          populate: [
            {
              path: "componentsAndCredits.component",
            },
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
      const result = await StudentTimeTable.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
