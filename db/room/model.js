const mongoose = require("mongoose");

require("@db/hostel/model");
require("@db/roomType/model");

const bedSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxLength: 100,
    required: [true, "Please provide bed name"],
  },
  position: {
    type: String,
    trim: true,
    maxLength: 200,
    required: [true, "Please provide bed position"],
  },
  allocated: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

const roomSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: [true, "Please provide a room number"],
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomType",
    required: [true, "Please provide a room type"],
  },
  allocatedBeds: {
    type: Number,
    default: 0,
  },
  totalBeds: {
    type: Number,
    default: function () {
      return this.beds.length;
    },
    required: [true, "Please provide a total number of of beds available"],
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: [true, "Please provide a hostel"],
  },
  beds: {
    type: [bedSchema],
    default: [],
    required: true,
  },
  note: {
    type: String,
    trim: true,
    maxLength: 200,
  },
});

roomSchema.pre("save", function (next) {
  this.totalBeds = this.beds.length;
  this.allocatedBeds = this.beds.filter((bed) => bed.allocated).length;
  next();
});

// Middleware to update totalBeds and allocatedBeds before updating the document
roomSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  console.log(update, "update");

  if (update.$set && update.$set.beds) {
    const beds = update.$set.beds;
    update.$set.totalBeds = beds.length;
    update.$set.allocatedBeds = beds.filter((bed) => bed.allocated).length;
  } else if (update.$addToSet && update.$addToSet.beds) {
    const room = await this.model.findOne(this.getQuery());
    const beds = [...room.beds, ...update.$addToSet.beds.$each];
    update.$set = update.$set || {};
    update.$set.totalBeds = beds.length;
    update.$set.allocatedBeds = beds.filter((bed) => bed.allocated).length;
  } else if (update.$pull && update.$pull.beds) {
    const room = await this.model.findOne(this.getQuery());

    if (room && room.beds) {
      console.log(room, update.$pull.beds._id, "room");
      const remainingBeds = room.beds.filter(
        (bed) => bed._id.toString() !== update.$pull.beds._id.toString()
      );

      console.log(remainingBeds, "remaining");

      update.$set = update.$set || {};
      update.$set.totalBeds = remainingBeds.length;
      update.$set.allocatedBeds = remainingBeds.filter(
        (bed) => bed.allocated
      ).length;
    } else {
      console.log("Room or beds not found", room);
      update.$set = update.$set || {};
      update.$set.totalBeds = 0;
      update.$set.allocatedBeds = 0;
    }
  } else if (update.$set) {
    const room = await this.model.findOne(this.getQuery());
    const beds = room?.beds;
    update.$set.totalBeds = beds?.length;
    update.$set.allocatedBeds = beds?.filter((bed) => bed.allocated).length;
  }

  next();
});

const Room = db.model("Room", roomSchema);

module.exports = Room;
