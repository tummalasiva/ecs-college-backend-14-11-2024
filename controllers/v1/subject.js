const subjectService = require("@services/helper/subject");

module.exports = class SubjectController {
  async create(req) {
    const params = { ...req.body, school: req.schoolId };
    try {
      const result = await subjectService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await subjectService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const params = req.body;
    const _id = req.params.id;
    try {
      const result = await subjectService.update(_id, params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await subjectService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await subjectService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async allocateSubjectsToStudents(req) {
    try {
      const result = await subjectService.allocateSubjectsToStudents(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getStudentSubject(req) {
    try {
      const result = await subjectService.getStudentSubject(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getCourseOverView(req) {
    try {
      const result = await subjectService.getCourseOverView(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getAllSubjectsOfThisSemesterAndDepartment(req) {
    try {
      const result =
        await subjectService.getAllSubjectsOfThisSemesterAndDepartment(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getAllStudentsForGivenSubject(req) {
    try {
      const result = await subjectService.getAllStudentsForGivenSubject(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getSubjectsForTimeTable(req) {
    try {
      const result = await subjectService.getSubjectsForTimeTable(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
