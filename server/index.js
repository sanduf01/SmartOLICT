const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const Lesson = require("./models/lesson");
const Quiz = require("./models/quiz");
const Question = require("./models/question");
const QuizAttempt = require("./models/quizAttempt");
const ProgressReport = require("./models/progressReport");
const Student = require("./models/student");
const Teacher = require("./models/teacher");
const Admin = require("./models/admin");
const Feedback = require("./models/feedback");
const GamificationPoints = require("./models/GamificationPoints");
const Leaderboard = require("./models/Leaderboard");
const InstantMessage = require("./models/InstantMessage");
const ContentLog = require("./models/contentLog");

mongoose.connect("mongodb+srv://admin01:admin1234@cluster0.ixli32v.mongodb.net/KVJP1");

async function run() {
  try {
    console.log("Connected to DB");

    // Clean old data (optional for testing)
    // await User.deleteMany({});
    // await Student.deleteMany({});
    // await Teacher.deleteMany({});
    // await Admin.deleteMany({});

    const hashedPassword = await bcrypt.hash("123", 10);

    // ===== USERS (Highest Role Only) =====

    const studentUser = await User.create({
      user_id: "U001",
      username: "stu_kamal",
      firstName: "Kamal",
      lastName: "Perera",
      email: "kamal@student.com",
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role: "student",
      registration_date: new Date()
    });

    const teacherUser = await User.create({
      user_id: "U002",
      username: "tea_saman",
      firstName: "Saman",
      lastName: "Silva",
      email: "saman@teacher.com",
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role: "teacher",
      registration_date: new Date()
    });

    const adminUser = await User.create({
      user_id: "U003",
      username: "adm_nimal",
      firstName: "Nimal",
      lastName: "Fernando",
      email: "nimal@admin.com",
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role: "admin",
      registration_date: new Date()
    });

    // ===== ROLE COLLECTIONS =====

    const student = await Student.create({
      user_id: studentUser._id,
      grade_level: "10"
    });

    const teacher = await Teacher.create({
      user_id: teacherUser._id,
      subject_specialization: "ICT"
    });

    const admin = await Admin.create({
      user_id: adminUser._id,
      access_level: "full",
      department: "Academic"
    });

    // ===== LESSON =====
    const lesson = await Lesson.create({
      lesson_id: "L001",
      lesson_title: "Introduction to ICT",
      lesson_content: "Basics of ICT systems",
      video_url: "https://youtube.com/sample",
      duration: 45,
      status: "active",
      created_date: new Date()
    });

    // ===== QUIZ =====
    const quiz = await Quiz.create({
      quiz_id: "QZ001",
      quiz_title: "ICT Basics Quiz",
      quiz_type: "MCQ",
      time_limit: 30,
      total_questions: 2,
      created_date: new Date(),
      lesson_id: lesson._id
    });

    // ===== QUESTIONS =====
    const question = await Question.insertMany([
      {
        question_id: "QS001",
        question_text: "What does ICT stand for?",
        question_type: "MCQ",
        options: ["Info Tech", "Information Communication Technology", "Internet Tech"],
        correct_answer: "Information Communication Technology",
        difficulty_level: "easy",
        points_value: 5,
        quiz_id: quiz._id
      },
      {
        question_id: "QS002",
        question_text: "ICT is mainly used for?",
        question_type: "MCQ",
        options: ["Cooking", "Communication", "Sports"],
        correct_answer: "Communication",
        difficulty_level: "easy",
        points_value: 5,
        quiz_id: quiz._id
      }
    ]);

    // ===== QUIZ ATTEMPT =====
    const attempt = await QuizAttempt.create({
      attempt_id: "AT001",
      student_id: student._id,  // Now using the student object from Student collection
      quiz_id: quiz._id,
      start_time: new Date(),
      end_time: new Date(Date.now() + 30 * 60000), // Add 30 minutes
      score_earned: 8,
      total_possible_score: 10,
      status: "completed"
    });

    // ===== PROGRESS REPORT =====
    await ProgressReport.create({
      report_id: "PR001",
      student_id: student._id,
      generated_date: new Date(),
      weak_areas: ["Definitions"],
      recommendations: ["Review lesson notes"]
    });

    // ===== FEEDBACK =====
    await Feedback.create({
      feedback_id: "FB001",
      student_id: student._id,
      quiz_id: quiz._id,
      feedback_content: "Good performance, revise definitions."
    });

    // ===== GAMIFICATION POINTS =====
    await GamificationPoints.create({
      student_id: student._id,
      points_value: 50,
      earned_date: new Date()
    });

    // ===== LEADERBOARD =====
    await Leaderboard.create({
      entry_id: "LB001",
      student_id: student._id,
      total_points: 50,
      rank_position: 1,
      period: "weekly",
      last_updated: new Date()
    });

    // ===== INSTANT MESSAGE =====
    await InstantMessage.create({
      message_id: "MSG001",
      sender_id: teacherUser._id,  // Using teacherUser._id (from User collection)
      receiver_id: studentUser._id,  // Added receiver_id for completeness
      message_content: "Well done on the quiz!",
      date: new Date(),
      time: "10:30 AM"
    });

    // ===== CONTENT LOG =====
    await ContentLog.create({
      log_id: "CL001",
      admin_id: admin._id,  // Using admin._id (from Admin collection)
      action_type: "add",
      content_type: "lesson",
      description: "Added ICT Introduction lesson",
      timestamp: new Date()
    });

    console.log("Data seeded successfully!");
    console.log("Student User:", studentUser.username);
    console.log("Teacher User:", teacherUser.username);
    console.log("Admin User:", adminUser.username);
    console.log("Student Record:", student);
    console.log("Teacher Record:", teacher);
    console.log("Admin Record:", admin);
    console.log("Lesson:", lesson.lesson_title);
    console.log("Quiz:", quiz.quiz_title);
    console.log("Quiz Attempt:", attempt.attempt_id);
    
    mongoose.connection.close();
    console.log("Database connection closed.");

  } catch(error) {
    console.log("Error:", error.message);
    console.log(error.stack);
  }
}

run();