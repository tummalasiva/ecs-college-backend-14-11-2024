const noticeService = require("@services/helper/notice");

module.exports = class NoticeController {
  async create(req) {
    const params = { ...req.body, school: req.schoolId };
    try {
      const result = await noticeService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await noticeService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listPublic(req) {
    try {
      const result = await noticeService.listPublic(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = req.body;
    const _id = req.params.id;
    try {
      const result = await noticeService.update(_id, bodyData, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await noticeService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await noticeService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
