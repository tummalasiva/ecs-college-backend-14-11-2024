const employeeService = require("@services/helper/employee");

module.exports = class EmployeeController {
  async create(req) {
    let parsedBody =
      typeof req.body.body === "string"
        ? JSON.parse(req.body.body)
        : req.body.body;

    const bodyData = { ...parsedBody, school: parsedBody.schoolId };
    const files = req.files;
    try {
      const result = await employeeService.create(bodyData, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await employeeService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    let parsedBody =
      typeof req.body.body === "string"
        ? JSON.parse(req.body.body)
        : req.body.body;

    const bodyData = { ...parsedBody, school: parsedBody.schoolId };
    const files = req.files;
    const _id = req.params.id;
    try {
      const result = await employeeService.update(
        _id,
        bodyData,
        req.employee,
        files
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await employeeService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await employeeService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateLibraryMember(req) {
    try {
      const result = await employeeService.updateLibraryMember(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async removeLibraryMember(req) {
    try {
      const result = await employeeService.removeLibraryMember(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getHodDashboardData(req) {
    try {
      const result = await employeeService.getHodDashboardData(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getDepartmentStudent(req) {
    try {
      const result = await employeeService.getDepartmentStudent(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
