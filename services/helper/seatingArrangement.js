const seatingArrangementQuery = require("@db/seatingArrangement/queries");
const SeatingArrangement = require("@db/seatingArrangement/model");
const buildingRoomQuery = require("@db/buildingRoom/queries");
const academicRoomQuery = require("@db/academicYear/queries");
const examScheduleQuery = require("@db/examSchedule/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

async function createSeatingArrangement(
  examSchedules,
  rooms,
  studentDistribution,
  academicYear
) {
  const seatAllocations = {}; // Track allocated seats per room
  const seatingArrangements = []; // To store the seating arrangement objects

  // Loop through each room
  for (const room of rooms) {
    const roomCapacity = room.numberOfRows * room.numberOfColumns;

    // Get total students to be seated in the current room
    const roomStudentDistribution = studentDistribution[room._id];
    if (!roomStudentDistribution) {
      console.error(`No student distribution provided for room ${room.name}.`);
      throw new Error(
        `No student distribution provided for room ${room.name}.`
      );
    }

    // Calculate the total number of students expected in the room
    let totalStudentsInRoom = Object.values(roomStudentDistribution).reduce(
      (total, count) => total + count,
      0
    );

    if (totalStudentsInRoom > roomCapacity) {
      console.error(
        `Room ${room.name} has insufficient capacity. Capacity is ${roomCapacity}, but ${totalStudentsInRoom} students are assigned.`
      );
      continue; // Skip this room if overbooked
    }

    // Collect students for this room from the exam schedules based on the provided distribution
    const roomStudents = [];
    for (const schedule of examSchedules) {
      const numStudents = roomStudentDistribution[schedule._id];
      if (numStudents && schedule.students.length >= numStudents) {
        const studentsForThisRoom = schedule.students.slice(0, numStudents);
        studentsForThisRoom.forEach((student) => {
          roomStudents.push({
            studentId: student,
            examScheduleId: schedule._id,
          });
        });
      }
    }

    // Shuffle students to distribute them better across seats (minimizes examSchedule grouping)
    shuffleArray(roomStudents);

    let seatIndex = 0;
    for (const student of roomStudents) {
      // Calculate row and column
      const row = Math.floor(seatIndex / room.numberOfRows) + 1;
      const column = (seatIndex % room.numberOfColumns) + 1;
      const seat = `R${row}C${column}`;

      // Check if the seat is already allocated in this room
      if (!seatAllocations[room._id]) {
        seatAllocations[room._id] = new Set();
      }
      if (seatAllocations[room._id].has(seat)) {
        console.error(
          `Seat conflict: Seat ${seat} in room ${room.name} is already allocated.`
        );
        continue; // Skip to next seat if there's a conflict
      }

      // Mark the seat as allocated for this room
      seatAllocations[room._id].add(seat);

      // Create seating arrangement for this student
      seatingArrangements.push({
        building: room.building._id,
        room: room._id,
        seat: seat,
        examSchedule: student.examScheduleId,
        student: student.studentId,
        academicYear: academicYear._id, // Include academic year as needed
      });

      seatIndex++;
    }
  }

  // Insert seating arrangements into the database
  await SeatingArrangement.insertMany(seatingArrangements);

  console.log("Seating arrangements created successfully.");
}

// Helper function to shuffle students (Fisher-Yates shuffle algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

module.exports = class SeatingArrangementService {
  static async create(req) {
    try {
      const { rooms, examSchedules, studentDistribution } = req.body;

      if (!Array.isArray(rooms))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Rooms should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(examSchedules))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Exam schedules should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      const givenRooms = await buildingRoomQuery.findAll({
        _id: { $in: rooms },
      });
      if (givenRooms.length !== rooms.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid room ids!",
          responseCode: "CLIENT_ERROR",
        });

      const givenExamSchedules = await examScheduleQuery.findAll({
        _id: { $in: examSchedules },
      });
      if (givenExamSchedules.length !== examSchedules.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid exam schedule ids!",
          responseCode: "CLIENT_ERROR",
        });

      const academicYear = await academicYearQuery.findOne({ active: true });
      if (!academicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found!",
          responseCode: "CLIENT_ERROR",
        });

      await createSeatingArrangement(
        examSchedules,
        rooms,
        studentDistribution,
        academicYear
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Seating arrangements created successfully!",
        responseCode: "SUCCESS",
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const result = await seatingArrangementQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const { seatingIds } = req.body;
      await SeatingArrangement.deleteMany({ _id: { $in: seatingIds } });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Seating arrangements deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
