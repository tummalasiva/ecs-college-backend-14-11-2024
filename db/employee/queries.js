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
          "school basicInfo.designation academicInfo.salaryGrade academicInfo.department role"
        )
        .select("-password -plainPassword")
        .lean();
      if (result) {
        if (!result.basicInfo.designation) {
          result.basicInfo.designation = result.basicInfo.fallbackDesignation;
          delete result.basicInfo.fallbackDesignation;
        }
        if (!result.academicInfo.salaryGrade) {
          result.academicInfo.salaryGrade =
            result.academicInfo.fallbackSalaryGrade;
          delete result.academicInfo.fallbackSalaryGrade;
        }

        if (!result.academicInfo.department) {
          result.academicInfo.department =
            result.academicInfo.fallbackDepartment;
          delete result.academicInfo.fallbackDepartment;
        }
        if (!result.role) {
          result.role = result.fallbackRole;
          delete result.fallbackRole;
        }
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update, options = {}) {
    try {
      const result = await Employee.findOneAndUpdate(filter, update, options)
        .populate(
          "school basicInfo.designation academicInfo.salaryGrade academicInfo.department role"
        )
        .select("-password -plainPassword")
        .lean();

      if (result) {
        if (!result.basicInfo.designation) {
          result.basicInfo.designation = result.basicInfo.fallbackDesignation;
          delete result.basicInfo.fallbackDesignation;
        }
        if (!result.academicInfo.salaryGrade) {
          result.academicInfo.salaryGrade =
            result.academicInfo.fallbackSalaryGrade;
          delete result.academicInfo.fallbackSalaryGrade;
        }

        if (!result.academicInfo.department) {
          result.academicInfo.department =
            result.academicInfo.fallbackDepartment;
          delete result.academicInfo.fallbackDepartment;
        }
        if (!result.role) {
          result.role = result.fallbackRole;
          delete result.fallbackRole;
        }
      }

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
          "school basicInfo.designation academicInfo.salaryGrade academicInfo.department role"
        )
        .select("-password -plainPassword")
        .lean();

      let finalList = [];
      for (let result of res) {
        if (!result.basicInfo.designation) {
          result.basicInfo.designation = result.basicInfo.fallbackDesignation;
          delete result.basicInfo.fallbackDesignation;
        }
        if (!result.academicInfo.salaryGrade) {
          result.academicInfo.salaryGrade =
            result.academicInfo.fallbackSalaryGrade;
          delete result.academicInfo.fallbackSalaryGrade;
        }

        if (!result.academicInfo.department) {
          result.academicInfo.department =
            result.academicInfo.fallbackDepartment;
          delete result.academicInfo.fallbackDepartment;
        }
        if (!result.role) {
          result.role = result.fallbackRole;
          delete result.fallbackRole;
        }
        finalList.push(result);
      }
      return finalList;
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
