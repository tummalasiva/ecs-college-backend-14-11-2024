// Dependencies
const roleService = require("@services/helper/role");

module.exports = class Role {
  async create(req) {
    const params = req.body;
    try {
      const createdRole = await roleService.create(params);
      return createdRole;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const params = req.body;
    try {
      const updatedRole = await roleService.update(req.params.id, params);
      return updatedRole;
    } catch (error) {
      return error;
    }
  }

  getRoleKeys(req) {
    try {
      const roleKeys = roleService.getRoleKeys();
      return roleKeys;
    } catch (error) {
      return error;
    }
  }

  async read(req) {
    try {
      const role = await roleService.read(req.params.id);
      return role;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const role = await roleService.delete(req.params.id);
      return role;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const roles = await roleService.list(req);
      return roles;
    } catch (error) {
      return error;
    }
  }
};
