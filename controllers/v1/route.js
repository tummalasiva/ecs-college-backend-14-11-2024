const routeService = require("@services/helper/route");

module.exports = class RouteController {
  async create(req) {
    try {
      const result = await routeService.create(req.body);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await routeService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const params = req.body;
    const _id = req.params.id;
    try {
      const result = await routeService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await routeService.delete(_id, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await routeService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async addStop(req) {
    try {
      const result = await routeService.addStop(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async removeStop(req) {
    try {
      const result = await routeService.removeStop(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateStop(req) {
    try {
      const result = await routeService.updateStop(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
