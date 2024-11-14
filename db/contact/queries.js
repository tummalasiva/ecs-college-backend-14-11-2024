const Contact = require("./model");

module.exports = class ContactData {
  static async create(data) {
    try {
      const result = await new Contact(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const contacts = await Contact.find(filter).lean();
      return contacts;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const contact = await Contact.findOne(filter)
      .lean();
      return contact;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update) {
    try {
      const result = await Contact.findOneAndUpdate(filter, update, {
        new: true,
      })
      .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await Contact.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
