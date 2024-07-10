const TeacherActivity = require("./model");

module.exports = class TeacherActivityData {
  static async create(data) {
    try {
      const result = await new TeacherActivity(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}, projection) {
    try {
      const result = await TeacherActivity.findOne(filter, projection)
        .populate(
          "class subject section academicYear createdBy feedbacks.givenBy"
        )
        .lean();

      if (result) {
        if (!result.class) {
          result.class = result.fallbackClass;
          delete result.fallbackClass;
        }
        if (!result.section) {
          result.section = result.fallbackSection;
          delete result.fallbackSection;
        }
        if (!result.createdBy) {
          result.createdBy = result.fallbackCreatedBy;
          delete result.fallbackCreatedBy;
        }
        let feedbacks = [];
        if (result.feedbacks.length) {
          for (let feedback of result.feedbacks) {
            if (!feedback.givenBy) {
              feedback.givenBy = feedback.fallbackGivenBy;
              delete feedback.fallbackGivenBy;
              feedbacks.push(feedback);
            } else {
              delete feedback.givenBy;
              feedbacks.push(feedback);
            }
          }
        }
        result.feedbacks = feedbacks;
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update, options = {}) {
    try {
      const result = await TeacherActivity.findOneAndUpdate(
        filter,
        update,
        options
      )
        .populate(
          "class subject section academicYear createdBy feedbacks.givenBy"
        )
        .lean();
      if (result) {
        if (!result.class) {
          result.class = result.fallbackClass;
          delete result.fallbackClass;
        }
        if (!result.section) {
          result.section = result.fallbackSection;
          delete result.fallbackSection;
        }
        if (!result.createdBy) {
          result.createdBy = result.fallbackCreatedBy;
          delete result.fallbackCreatedBy;
        }
        let feedbacks = [];
        if (result.feedbacks.length) {
          for (let feedback of result.feedbacks) {
            if (!feedback.givenBy) {
              feedback.givenBy = feedback.fallbackGivenBy;
              delete feedback.fallbackGivenBy;
              feedbacks.push(feedback);
            } else {
              delete feedback.givenBy;
              feedbacks.push(feedback);
            }
          }
        }
        result.feedbacks = feedbacks;
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateList(filter = {}, update) {
    try {
      const result = await TeacherActivity.updateMany(filter, update);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const res = await TeacherActivity.find(filter)
        .sort({ createdAt: -1 })
        .populate(
          "class subject section academicYear createdBy feedbacks.givenBy"
        )
        .lean();
      let finalList = [];
      for (let result of res) {
        if (!result.class) {
          result.class = result.fallbackClass;
          delete result.fallbackClass;
        }
        if (!result.section) {
          result.section = result.fallbackSection;
          delete result.fallbackSection;
        }
        if (!result.createdBy) {
          result.createdBy = result.fallbackCreatedBy;
          delete result.fallbackCreatedBy;
        }
        let feedbacks = [];
        if (result.feedbacks.length) {
          for (let feedback of result.feedbacks) {
            if (!feedback.givenBy) {
              feedback.givenBy = feedback.fallbackGivenBy;
              delete feedback.fallbackGivenBy;
              feedbacks.push(feedback);
            } else {
              delete feedback.givenBy;
              feedbacks.push(feedback);
            }
          }
        }
        result.feedbacks = feedbacks;
        finalList.push(result);
      }
      return finalList;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      return await TeacherActivity.findOneAndDelete(filter);
    } catch (error) {
      throw error;
    }
  }
};
