const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb+srv://admin01:admin1234@cluster0.ixli32v.mongodb.net/KVJP1")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const User = require("./models/user");
const Student = require("./models/student");

async function migrate() {
  try {
    console.log("Starting migration...");

    // Get all users with role "student"
    const students = await User.find({ role: "student" });
    console.log(`Found ${students.length} users with role 'student'`);

    for (const studentUser of students) {
      // Check if Student record already exists
      const existingStudent = await Student.findOne({ user_id: studentUser._id });
      
      if (!existingStudent) {
        // Create Student record
        await Student.create({
          user_id: studentUser._id,
          grade_level: "10"
        });
        console.log(`Created Student record for user: ${studentUser.username}`);
      } else {
        console.log(`Student record already exists for user: ${studentUser.username}`);
      }
    }

    console.log("Migration completed!");
    
    // Display all students
    const allStudents = await Student.find().populate('user_id', 'username email');
    console.log(`\nTotal students in database: ${allStudents.length}`);
    allStudents.forEach((s, i) => {
      console.log(`${i + 1}. ${s.user_id?.username || 'Unknown'} (${s.user_id?.email || 'No email'}) - Grade: ${s.grade_level}`);
    });

  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    mongoose.connection.close();
  }
}

migrate();
