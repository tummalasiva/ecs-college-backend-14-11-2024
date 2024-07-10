const repairService = require("@services/helper/repair");
const fuelService = require("@services/helper/fuel");
const tyreService = require("@services/helper/tyre");
const greecingService = require("@services/helper/greecing");

module.exports = class MaintenanceController {
  // fuel

  async createFuel(req) {
    try {
      const result = await fuelService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listFuel(req) {
    try {
      const result = await fuelService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateFuel(req) {
    try {
      const result = await fuelService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteFuel(req) {
    const _id = req.params.id;
    try {
      const result = await fuelService.delete(_id, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  // repair

  async createRepair(req) {
    try {
      const result = await repairService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listRepair(req) {
    try {
      const result = await repairService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateRepair(req) {
    try {
      const result = await repairService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteRepair(req) {
    const _id = req.params.id;
    try {
      const result = await repairService.delete(_id, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  // greecing

  async createGreecing(req) {
    try {
      const result = await greecingService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listGreecing(req) {
    try {
      const result = await greecingService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateGreecing(req) {
    try {
      const result = await greecingService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteGreecing(req) {
    const _id = req.params.id;
    try {
      const result = await greecingService.delete(_id, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  // tyre

  async createTyre(req) {
    try {
      const result = await tyreService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listTyre(req) {
    try {
      const result = await tyreService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateTyre(req) {
    try {
      const result = await tyreService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteTyre(req) {
    const _id = req.params.id;
    try {
      const result = await tyreService.delete(_id, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }
};
