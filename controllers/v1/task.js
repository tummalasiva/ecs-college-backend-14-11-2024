const taskService = require("@services/helper/task");

module.exports = class TaskController {
  async create(req) {
    try {
      const createdTask = await taskService.create(req);
      return createdTask;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const task = await taskService.list(req);
      return task;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedTask = await taskService.update(req);
      return updatedTask;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const deletedTask = await taskService.delete(req);
      return deletedTask;
    } catch (error) {
      return error;
    }
  }
};
