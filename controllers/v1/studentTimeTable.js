const studentTimeTableService = require("@services/helper/studentTimeTable");

module.exports = class StudentTimeTableController {
  async create(req) {
    try {
      const createdStudentTimeTable = await studentTimeTableService.create(req);
      return createdStudentTimeTable;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await studentTimeTableService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedStudentTimeTable = await studentTimeTableService.update(req);
      return updatedStudentTimeTable;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const deletedStudentTimeTable = await studentTimeTableService.delete(_id);
      return deletedStudentTimeTable;
    } catch (error) {
      return error;
    }
  }

  async getStudentTimeTable(req) {
    try {
      const updatedStudentTimeTable =
        await studentTimeTableService.getStudentTimeTable(req);
      return updatedStudentTimeTable;
    } catch (error) {
      return error;
    }
  }

  async getEmployeeTimeTable(req) {
    try {
      const updatedStudentTimeTable =
        await studentTimeTableService.getEmployeeTimeTable(req);
      return updatedStudentTimeTable;
    } catch (error) {
      return error;
    }
  }
};
