const mongoose = require('mongoose');
const Lesson = require('./models/lesson');
const Quiz = require('./models/quiz');
const Question = require('./models/question');

require('dotenv').config();

mongoose.connect("mongodb+srv://admin01:admin1234@cluster0.ixli32v.mongodb.net/KVJP1")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

const seedData = async () => {
  try {
    // Clear existing data
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});

    // Create lessons for Grade 10
    const grade10Lessons = [];
    for (let i = 1; i <= 9; i++) {
      const lesson = new Lesson({
        lesson_title: `Lesson ${i.toString().padStart(2, '0')}`,
        grade: "10",
        lesson_content: `Content for Grade 10 Lesson ${i}`,
        video_url: `https://example.com/lesson${i}.mp4`
      });
      await lesson.save();
      grade10Lessons.push(lesson);
    }

    // Create quiz for each lesson
    for (const lesson of grade10Lessons) {
      const quiz = new Quiz({
        quiz_title: `${lesson.lesson_title} Quiz`,
        lesson_id: lesson._id,
        grade: "10",
        questions: []
      });

      // Create sample questions
      const questions = [];
      for (let j = 1; j <= 5; j++) {
        const question = new Question({
          question_text: `Question ${j} for ${lesson.lesson_title}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answer: 'Option A'
        });
        await question.save();
        questions.push(question._id);
      }

      quiz.questions = questions;
      await quiz.save();
    }

    // Create lessons for Grade 11
    const grade11Lessons = [];
    for (let i = 1; i <= 6; i++) {
      const lesson = new Lesson({
        lesson_title: `Lesson ${i.toString().padStart(2, '0')}`,
        grade: "11",
        lesson_content: `Content for Grade 11 Lesson ${i}`,
        content_type: i === 1 ? 'youtube' : 'video', // Set first lesson to YouTube
        content_url: i === 1 ? 'https://youtu.be/dTUnquiey0E?si=eEjPt26q8EPWMKgU' : `https://example.com/lesson${i}.mp4`
      });
      await lesson.save();
      grade11Lessons.push(lesson);
    }

    // Create quiz for each Grade 11 lesson
    for (const lesson of grade11Lessons) {
      const quiz = new Quiz({
        title: `${lesson.lesson_title} Quiz`,
        lesson_id: lesson._id,
        grade: "11",
        questions: []
      });

      // Create sample questions
      const questions = [];
      for (let j = 1; j <= 5; j++) {
        const question = new Question({
          question_text: `Question ${j} for ${lesson.lesson_title}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answer: 'Option A'
        });
        await question.save();
        questions.push(question._id);
      }

      quiz.questions = questions;
      await quiz.save();
    }

    console.log('Data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();