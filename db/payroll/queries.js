const { Payroll } = require("./model");

module.exports = class PayrollClass {
  static async findOne(filter, projection = {}) {
    try {
      const payroll = await Payroll.findOne(filter, projection).lean({
        getters: true,
      });
      return payroll;
    } catch (error) {
      return error;
    }
  }

  static async findById(id) {
    try {
      const payroll = await Payroll.findById(id).lean({
        getters: true,
      });
      return payroll;
    } catch (error) {
      return error;
    }
  }

  static async findAllPayrolls(filter, projection = {}) {
    try {
      const data = await Payroll.find(filter, projection).lean({
        getters: true,
      });
      return data;
    } catch (error) {
      return error;
    }
  }

  static async create(data) {
    try {
      const salaryGrade = await Payroll(data).save();
      return salaryGrade;
    } catch (error) {
      return error;
    }
  }

  static async updateOnePayroll(filter, update, options = {}) {
    try {
      const res = await Payroll.updateOne(filter, update, options);
      if (
        (res.n === 1 && res.nModified === 1) ||
        (res.matchedCount === 1 && res.modifiedCount === 1)
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return error;
    }
  }

  static async findByIdAndUpdatePayroll(id, update, options = {}) {
    try {
      const data = await Payroll.findByIdAndUpdate(id, update, options);
      return data;
    } catch (error) {
      return error;
    }
  }

  static async findByOneAndUpdate(filter, update, options = {}) {
    try {
      const data = await Payroll.findOneAndUpdate(filter, update, options);
      return data;
    } catch (error) {
      return error;
    }
  }

  static async listPaymentHistory(page, limit, search) {
    try {
      let data = await Payroll.aggregate([
        {
          $match: {
            $or: [
              { month: new RegExp(search, "i") },
              { year: new RegExp(search, "i") },
            ],
          },
        },

        {
          $facet: {
            totalCount: [{ $count: "count" }],
            data: [{ $skip: limit * (page - 1) }, { $limit: limit }],
          },
        },
      ]);

      return data;
    } catch (error) {
      return error;
    }
  }

  static async findByIdAndDeletePayroll(id) {
    try {
      const data = await Payroll.findByIdAndDelete(id).lean({
        getters: true,
      });
      return data;
    } catch (error) {
      return error;
    }
  }
};
