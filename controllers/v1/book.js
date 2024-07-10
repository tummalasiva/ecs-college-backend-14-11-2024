const bookService = require("@services/helper/library/book");

module.exports = class BookController {
  async create(req) {
    const bodyData = { ...req.body, school: req.schoolId };
    const files = req.files;
    try {
      const result = await bookService.create(bodyData, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await bookService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const id = req.params.id;
    const bodyData = req.body;
    const files = req.files;
    try {
      const result = await bookService.update(id, bodyData, files);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await bookService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
