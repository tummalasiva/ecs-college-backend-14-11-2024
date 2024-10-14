const Employee = require("./model");

module.exports = class EmployeeData {
  static async create(data) {
    try {
      const result = await new Employee(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter, projection = {}) {
    try {
      const result = await Employee.findOne(filter, projection)
        .populate(
          "school basicInfo.designation academicInfo.subjects academicInfo.salaryGrade academicInfo.department role academicInfo.building academicInfo.room"
        )
        .select("-password -plainPassword")
        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update, options = {}) {
    try {
      const result = await Employee.findOneAndUpdate(filter, update, options)
        .populate(
          "school basicInfo.designation academicInfo.subjects academicInfo.salaryGrade academicInfo.department role academicInfo.building academicInfo.room"
        )
        .select("-password -plainPassword")
        .lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const res = await Employee.find(filter)
        .sort({ orderSequence: 1 })
        .populate(
          "school basicInfo.designation academicInfo.subjects academicInfo.salaryGrade academicInfo.department role academicInfo.building academicInfo.room"
        )
        .select("-password -plainPassword")
        .lean();

      return res;
    } catch (error) {
      throw error;
    }
  }

  static async updateMany(filter, data) {
    try {
      const result = await Employee.updateMany(filter, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await Employee.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
