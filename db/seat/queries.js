const Seat = require("./model");

module.exports = class SeatData {
  static async create(data) {
    try {
      const seat = await new Seat(data).save();
      return seat;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter) {
    try {
      const seats = await Seat.find(filter)
        .populate({
          path: "room",
          populate: {
            path: "building",
          },
        })
        .lean();
      return seats;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const seat = await Seat.findOne(filter)
        .populate({
          path: "room",
          populate: {
            path: "building",
          },
        })
        .lean();
      return seat;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const seat = await Seat.findOneAndUpdate(filter, data, { new: true })
        .populate({
          path: "room",
          populate: {
            path: "building",
          },
        })
        .lean();
      return seat;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const seat = await Seat.deleteOne(filter);
      return seat;
    } catch (error) {
      throw error;
    }
  }

  static async deleteMany(filter = {}) {
    try {
      const seats = await Seat.deleteMany(filter);
      return seats;
    } catch (error) {
      throw error;
    }
  }
};
