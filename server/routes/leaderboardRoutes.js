const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/leaderboard');
const QuizAttempt = require('../models/quizAttempt');
const { authenticateToken } = require('../middleware/auth');

// Get leaderboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    const Student = require('../models/student');
    const User = require('../models/user');
    
    // First, get only students (role: "student") with their user info
    const allStudents = await Student.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          'user.role': 'student'  // Only include students, exclude admin/teacher
        }
      },
      {
        $project: {
          studentId: '$_id',
          user_id: '$user.user_id',
          username: '$user.username',
          profileImage: '$user.profileImage'
        }
      }
    ]);

    // Get all quiz attempts with quiz info (to get lesson_id)
    const quizAttempts = await QuizAttempt.aggregate([
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quiz_id',
          foreignField: '_id',
          as: 'quiz'
        }
      },
      {
        $unwind: {
          path: '$quiz',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          student_id: { $exists: true, $ne: null },
          'quiz.lesson_id': { $exists: true, $ne: null }
        }
      },
      {
        $project: {
          student_id: 1,
          score_earned: 1,
          start_time: 1,
          end_time: 1,
          lesson_id: '$quiz.lesson_id'
        }
      }
    ]);

    // For each student, calculate the highest score per lesson and track ALL times for best score
    const studentData = {};

    allStudents.forEach(student => {
      studentData[student.studentId.toString()] = {
        studentId: student.studentId,
        user_id: student.user_id,
        username: student.username,
        profileImage: student.profileImage,
        lessonBestScores: {}, // { lessonId: { score: number, times: [time1, time2, ...] } }
        totalScore: 0,
        avgTime: 0
      };
    });

    // Process attempts: find highest score per lesson per student, track all times for best score
    quizAttempts.forEach(attempt => {
      const studentIdStr = attempt.student_id.toString();
      if (!studentData[studentIdStr]) return;

      const lessonIdStr = attempt.lesson_id.toString();
      const timeTaken = attempt.end_time && attempt.start_time 
        ? (new Date(attempt.end_time) - new Date(attempt.start_time)) / 1000 // in seconds
        : 0;

      // Initialize lesson if not exists
      if (!studentData[studentIdStr].lessonBestScores[lessonIdStr]) {
        studentData[studentIdStr].lessonBestScores[lessonIdStr] = {
          score: attempt.score_earned,
          times: timeTaken > 0 ? [timeTaken] : []
        };
      } else {
        const best = studentData[studentIdStr].lessonBestScores[lessonIdStr];
        
        if (attempt.score_earned > best.score) {
          // New higher score - replace times with current attempt's time
          best.score = attempt.score_earned;
          best.times = timeTaken > 0 ? [timeTaken] : [];
        } else if (attempt.score_earned === best.score) {
          // Same highest score - add time to the array (for avgTime calculation)
          if (timeTaken > 0) {
            best.times.push(timeTaken);
          }
        }
        // If lower score, ignore
      }
    });

    // Calculate totalScore and avgTime for each student
    const leaderboard = Object.values(studentData).map(student => {
      // Sum of highest scores per lesson (each lesson counts once)
      const lessonBestArray = Object.values(student.lessonBestScores);
      const totalScore = lessonBestArray.reduce((sum, lb) => sum + lb.score, 0);
      
      // Average of ALL times from attempts that achieved the highest score
      const allBestTimes = lessonBestArray.flatMap(lb => lb.times);
      const avgTime = allBestTimes.length > 0
        ? allBestTimes.reduce((sum, t) => sum + t, 0) / allBestTimes.length
        : 0;

      return {
        user_id: student.user_id,
        username: student.username,
        profileImage: student.profileImage,
        totalScore: totalScore,
        avgTime: Math.round(avgTime * 100) / 100 // Round to 2 decimal places
      };
    });

    // Sort by totalScore descending, then by avgTime ascending (tie-breaker)
    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return a.avgTime - b.avgTime; // Lower avgTime is better
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard aggregation error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
