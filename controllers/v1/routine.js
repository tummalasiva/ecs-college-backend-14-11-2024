// Dependencies
const routineService = require("@services/helper/routine");

module.exports = class RoutineController {
  async create(req) {
    try {
      const createdRole = await routineService.create(req);
      return createdRole;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedRole = await routineService.update(req);
      return updatedRole;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const role = await routineService.delete(req);
      return role;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const roles = await routineService.list(req);
      return roles;
    } catch (error) {
      return error;
    }
  }
};
