const questionnaireHelper = require("@services/helper/questionnaire");

module.exports = class QuestionnaireController {
  async create(req) {
    try {
      const createdQuestionnaire = await questionnaireHelper.create(req);
      return createdQuestionnaire;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const allQuestionnaires = await questionnaireHelper.list(req);
      return allQuestionnaires;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedQuestionnaire = await questionnaireHelper.update(req);
      return updatedQuestionnaire;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const deletedQuestionnaire = await questionnaireHelper.delete(req);
      return deletedQuestionnaire;
    } catch (error) {
      return error;
    }
  }

  async toggleActiveStatus(req) {
    try {
      const updatedQuestionnaire = await questionnaireHelper.toggleActiveStatus(
        req
      );
      return updatedQuestionnaire;
    } catch (error) {
      return error;
    }
  }

  async getCoAttainment(req) {
    try {
      const coAttainment = await questionnaireHelper.getCoAttainment(req);
      return coAttainment;
    } catch (error) {
      return error;
    }
  }
  async getMyQuestionnaires(req) {
    try {
      const coAttainment = await questionnaireHelper.getMyQuestionnaires(req);
      return coAttainment;
    } catch (error) {
      return error;
    }
  }
};
