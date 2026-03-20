import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './manage-content.css';
import api from '../utils/api';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function ManageContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('lessons');
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deletedLessons, setDeletedLessons] = useState([]);
  const [deletedQuizzes, setDeletedQuizzes] = useState([]);
  const [recycleBinTab, setRecycleBinTab] = useState('lessons');
  const [userRole, setUserRole] = useState('');
  const [lessonModal, setLessonModal] = useState({ open: false, lesson: null });
  const lessonModalRef = useRef(null);
  const successTimeoutRef = useRef(null);

  // Missing states
  const [selectedGrade, setSelectedGrade] = useState(searchParams.get('grade') || '10');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [contentType, setContentType] = useState('youtube');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionFormData, setQuestionFormData] = useState({});
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionOptions, setQuestionOptions] = useState(['']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLessonToDelete, setSelectedLessonToDelete] = useState(null);
  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
  const [selectedQuizToDelete, setSelectedQuizToDelete] = useState(null);

  // Function to set success message with timeout
  const setSuccessMessageWithTimeout = (message) => {
    setSuccessMessage(message);
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Fetch lessons and quizzes
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await api.get(`/api/lessons/grade/${selectedGrade}`);
        setLessons(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchQuizzes = async () => {
      try {
        const response = await api.get(`/api/quizzes/grade/${selectedGrade}`);
        let filteredQuizzes = response.data;
        if (selectedLesson) {
          filteredQuizzes = filteredQuizzes.filter(q => q.lesson_id === selectedLesson || q.lesson_id?._id === selectedLesson);
        }
        setQuizzes(filteredQuizzes);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchDeletedLessons = async () => {
      try {
        const response = await api.get(`/api/lessons/deleted/all`);
        setDeletedLessons(response.data);
      } catch (err) {
        console.error('Error fetching deleted lessons:', err);
      }
    };

    const fetchDeletedQuizzes = async () => {
      try {
        const response = await api.get(`/api/quizzes/deleted/all`);
        setDeletedQuizzes(response.data);
      } catch (err) {
        console.error('Error fetching deleted quizzes:', err);
      }
    };

    const fetchAllQuestions = async () => {
      try {
        const response = await api.get('/api/questions');
        setAllQuestions(response.data);
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
    };

    fetchLessons();
    fetchQuizzes();
    fetchDeletedLessons();
    fetchDeletedQuizzes();
    fetchAllQuestions();
    setLoading(false);
  }, [selectedGrade, selectedLesson]);

  // Get user role
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.effectiveRole);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
  }, []);

  // Handle query params for opening lesson modal
  useEffect(() => {
    const lessonId = searchParams.get('lesson');
    if (lessonId && lessons.length > 0 && (userRole === 'teacher' || userRole === 'admin')) {
      const lesson = lessons.find(l => l._id === lessonId);
      if (lesson) {
        setEditingItem({ ...lesson, type: 'lesson' });
              setFormData({
                lesson_title: lesson.lesson_title,
                lesson_content: lesson.lesson_content,
                content_url: lesson.content_url || '',
                duration: lesson.duration,
                image_url: lesson.image_url || '',
              });
        setContentType(lesson.content_type || 'youtube');
        setLessonModal({ open: true, lesson });
      }
    }
  }, [lessons, searchParams, userRole]);

  // Handle inputs
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => setVideoFile(e.target.files[0]);

  const handleImageFileChange = e => setImageFile(e.target.files[0]);

  // Handle question form inputs
  const handleQuestionInputChange = e => {
    const { name, value } = e.target;
    setQuestionFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle question options
  const handleOptionChange = (index, value) => {
    const newOptions = [...questionOptions];
    newOptions[index] = value;
    setQuestionOptions(newOptions);
  };

  const addOption = () => {
    setQuestionOptions([...questionOptions, '']);
  };

  const removeOption = (index) => {
    const newOptions = questionOptions.filter((_, i) => i !== index);
    setQuestionOptions(newOptions);
  };

  // Start editing a question
  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionFormData({
      question_text: question.question_text || '',
      question_type: question.question_type || 'multiple-choice',
      options: question.options || [],
      correct_answer: question.correct_answer || '',
      difficulty_level: question.difficulty_level || 'easy',
      points_value: question.points_value || 1,
    });
    setQuestionOptions(question.options || ['']);
  };

  // Start creating a new question
  const handleCreateQuestion = () => {
    setEditingQuestion({ _id: 'new' });
    setQuestionFormData({
      question_text: '',
      question_type: 'multiple-choice',
      options: [],
      correct_answer: '',
      difficulty_level: 'easy',
      points_value: 1,
    });
    setQuestionOptions(['']);
  };

  // Cancel editing question
  const handleCancelEditQuestion = () => {
    setEditingQuestion(null);
    setQuestionFormData({});
    setQuestionOptions(['']);
  };

  // Open quiz questions modal
  const handleManageQuestions = async (quiz) => {
    setEditingItem({ ...quiz, type: 'quiz' });
    try {
      // Fetch current questions for this quiz
      const quizResponse = await api.get(`/api/quizzes/${quiz._id}`);
      const quizData = quizResponse.data;
      setQuizQuestions(quizData.questions || []);
      setShowQuestionModal(true);
    } catch (err) {
      setError('Failed to load quiz questions');
    }
  };

  // Start quiz
  const handleQuizStart = (quizId) => {
    const quiz = quizzes.find(q => q._id === quizId);
    if (quiz) {
      const lesson = lessons.find(l => l._id === quiz.lesson_id || l._id === quiz.lesson_id?._id);
      if (lesson) {
        const lessonIndex = lessons.indexOf(lesson);
        const lessonNumber = lessonIndex + 1;
        navigate(`/quiz2/${selectedGrade}/${lessonNumber}`);
      }
    }
  };

  // Add question to quiz
  const handleAddQuestionToQuiz = async (questionId) => {
    try {
      const updatedQuestions = [...quizQuestions, questionId];
      await api.put(`/api/quizzes/${editingItem._id}`, {
        questions: updatedQuestions
      });
      setQuizQuestions(updatedQuestions);
      setSuccessMessageWithTimeout('Question added to quiz successfully!');
    } catch (err) {
      setError('Failed to add question to quiz');
    }
  };

  // Remove question from quiz
  const handleRemoveQuestionFromQuiz = async (questionId) => {
    try {
      const updatedQuestions = quizQuestions.filter(id => id !== questionId);
      await api.put(`/api/quizzes/${editingItem._id}`, {
        questions: updatedQuestions
      });
      setQuizQuestions(updatedQuestions);
      setSuccessMessageWithTimeout('Question removed from quiz successfully!');
    } catch (err) {
      setError('Failed to remove question from quiz');
    }
  };

  // Save new question
  const handleSaveQuestion = async () => {
    try {
      setUploading(true);
      const isNew = !editingQuestion || editingQuestion._id === 'new';
      const method = isNew ? 'post' : 'put';
      const url = isNew ? '/api/questions' : `/api/questions/${editingQuestion._id}`;

      const dataToSave = { ...questionFormData, options: questionOptions.filter(opt => opt.trim() !== '') };
      const response = await api[method](url, dataToSave);
      setAllQuestions(prev => isNew ? [...prev, response.data] : prev.map(q => q._id === editingQuestion._id ? response.data : q));

      // If it's a new question, automatically add it to the current quiz
      if (isNew && editingItem && editingItem.type === 'quiz') {
        await handleAddQuestionToQuiz(response.data._id);
      }

      setSuccessMessageWithTimeout(`Question ${isNew ? 'created' : 'updated'} successfully!`);

      setEditingQuestion(null);
      setQuestionFormData({});
      setQuestionOptions(['']);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Delete lesson
  const handleDeleteLesson = async () => {
    if (!selectedLessonToDelete) return;
    try {
      await api.delete(`/api/lessons/${selectedLessonToDelete._id}`);
      setLessons(prev => prev.filter(l => l._id !== selectedLessonToDelete._id));
      setSuccessMessageWithTimeout('Lesson moved to recycle bin successfully!');
      setShowDeleteModal(false);
      setSelectedLessonToDelete(null);
    } catch (err) {
      setError('Failed to delete lesson');
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async () => {
    if (!selectedQuizToDelete) return;
    try {
      await api.delete(`/api/quizzes/${selectedQuizToDelete._id}`);
      setQuizzes(prev => prev.filter(q => q._id !== selectedQuizToDelete._id));
      setSuccessMessageWithTimeout('Quiz moved to recycle bin successfully!');
      setShowDeleteQuizModal(false);
      setSelectedQuizToDelete(null);
    } catch (err) {
      setError('Failed to delete quiz');
    }
  };

  // Restore item
  const handleRestore = async (id, type) => {
    try {
      await api.post(`/api/${type === 'lesson' ? 'lessons' : 'quizzes'}/${id}/restore`);
      if (type === 'lesson') {
        setDeletedLessons(prev => prev.filter(l => l._id !== id));
        // Refresh lessons list
        const response = await api.get(`/api/lessons/grade/${selectedGrade}`);
        setLessons(response.data);
      } else {
        setDeletedQuizzes(prev => prev.filter(q => q._id !== id));
        // Refresh quizzes list
        const response = await api.get(`/api/quizzes/grade/${selectedGrade}`);
        setQuizzes(response.data);
      }
      setSuccessMessageWithTimeout(`${type.charAt(0).toUpperCase() + type.slice(1)} restored successfully!`);
    } catch (err) {
      setError(`Failed to restore ${type}`);
    }
  };

  // Permanently delete item
  const handlePermanentDelete = async (id, type) => {
    try {
      await api.delete(`/api/${type === 'lesson' ? 'lessons' : 'quizzes'}/${id}/permanent`);
      if (type === 'lesson') {
        setDeletedLessons(prev => prev.filter(l => l._id !== id));
      } else {
        setDeletedQuizzes(prev => prev.filter(q => q._id !== id));
      }
      setSuccessMessageWithTimeout(`${type.charAt(0).toUpperCase() + type.slice(1)} permanently deleted!`);
    } catch (err) {
      setError(`Failed to permanently delete ${type}`);
    }
  };

  // Save lesson/quiz
  const handleSave = async () => {
    if (!editingItem) return;
    try {
      setUploading(true);
      let contentUrl = formData.content_url;
      let videoFileId = formData.video_file_id;
      let imageUrl = formData.image_url;

      if (videoFile && editingItem.type === 'lesson' && contentType === 'video') {
        const formDataUpload = new FormData();
        formDataUpload.append('video', videoFile);
        const uploadResponse = await api.post('/api/lessons/upload-video', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        contentUrl = uploadResponse.data.content_url;
        videoFileId = uploadResponse.data.video_file_id;
      }

      // Handle image upload for lesson card (file upload)
      if (imageFile && editingItem.type === 'lesson') {
        const formDataImage = new FormData();
        formDataImage.append('image', imageFile);
        const imageUploadResponse = await api.post('/api/lessons/upload-image', formDataImage, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = imageUploadResponse.data.image_url;
      } else if (editingItem.type === 'lesson') {
        // Use the URL entered in the text field
        imageUrl = formData.image_url;
      }

      let dataToSave = { ...formData, content_url: contentUrl, content_type: contentType, image_url: imageUrl };

if (editingItem.type === 'lesson') {
  dataToSave.grade = selectedGrade.toString(); // ensure string
} else if (editingItem.type === 'quiz') {
  dataToSave.grade = selectedGrade.toString(); // ensure string for quizzes too
}
  
dataToSave.time_limit = Number(formData.time_limit); // convert to number
dataToSave.total_questions = Number(formData.total_questions); // convert to number
  dataToSave.quiz_type = contentType;
  if (selectedLesson && selectedLesson !== '') {
    dataToSave.lesson_id = selectedLesson; // only include if not empty
  } else {
    delete dataToSave.lesson_id; // remove empty lesson_id
  }


// Optional: debug log
console.log('Quiz data to save:', dataToSave);


      const isNew = editingItem._id === 'new';
      const method = isNew ? 'post' : 'put';
      const url = isNew
        ? `/api/${editingItem.type === 'lesson' ? 'lessons' : 'quizzes'}`
        : `/api/${editingItem.type === 'lesson' ? 'lessons' : 'quizzes'}/${editingItem._id}`;

      const response = await api[method](url, dataToSave);

      if (editingItem.type === 'lesson') {
        setLessons(prev => isNew ? [...prev, response.data] : prev.map(l => l._id === editingItem._id ? response.data : l));
      } else {
        setQuizzes(prev => isNew ? [...prev, response.data] : prev.map(q => q._id === editingItem._id ? response.data : q));
      }

      setSuccessMessage(`${editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)} saved successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);

      setEditingItem(null);
      setFormData({});
      setVideoFile(null);
      setContentType('h5p');
      setLessonModal({ open: false, lesson: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="manage-content-container">Loading...</div>;

  return (
    <div className="manage-content-container">
      <h1>Manage Content</h1>

      <div className="content-controls">
        <div className="control-group">
          <label>Select Grade: </label>
          <select value={selectedGrade} onChange={e => { setSelectedGrade(e.target.value); setSelectedLesson(''); }}>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
          </select>
        </div>

        {activeTab === 'quizzes' && (
          <div className="control-group">
            <label>Select Lesson: </label>
            <select value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)}>
              <option value="">All Lessons</option>
              {lessons.map(lesson => <option key={lesson._id} value={lesson._id}>{lesson.lesson_title}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="tabs">
        <button className={activeTab === 'lessons' ? 'active' : ''} onClick={() => setActiveTab('lessons')}>Lessons</button>
        <button className={activeTab === 'quizzes' ? 'active' : ''} onClick={() => setActiveTab('quizzes')}>Quizzes</button>
        <button className={activeTab === 'recycle-bin' ? 'active' : ''} onClick={() => setActiveTab('recycle-bin')}>Deleted Items</button>

        <div className="top-right-nav">
          <FaArrowLeft className="nav-icon" title="Back" onClick={() => navigate('/dashboard')} />
          <FaArrowRight className="nav-icon" title="Next" onClick={() => navigate('/homepage')} />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      {/* ===== ACTION BUTTON ===== */}
<div className="action-buttons">
{(userRole === 'teacher' || userRole === 'admin') && activeTab !== 'recycle-bin' && activeTab !== 'quizzes' && (
    <button
      className="create-btn"
      onClick={() => {
        setEditingItem({ type: activeTab.slice(0, -1), _id: 'new' });
        setFormData({});
        setVideoFile(null);
        setContentType('youtube');
        setLessonModal({ open: true, lesson: null });
      }}
    >
      Create New {activeTab.slice(0, -1)}
    </button>
  )}
</div>

{/* ===== LESSONS TAB ===== */}
{activeTab === 'lessons' && (
  <div className="content-section">
    <div className="action-buttons">
      {(userRole === 'teacher' || userRole === 'admin') && (
        <button
          className="delete-btn"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Lessons
        </button>
      )}
    </div>
    <h2>Lessons</h2>
    <div className="items-list">
      {lessons.map(lesson => (
        <div
          key={lesson._id}
          className="item-card"
          onClick={() => {
            if (userRole === 'teacher' || userRole === 'admin') {
              setEditingItem({ ...lesson, type: 'lesson' });
              setFormData({
                lesson_title: lesson.lesson_title,
                lesson_content: lesson.lesson_content,
                content_url: lesson.content_url || '',
                duration: lesson.duration,
                image_url: lesson.image_url || '',
              });
              setContentType(lesson.content_type || 'youtube');
              setLessonModal({ open: true, lesson });
            }
          }}
          style={{ cursor: (userRole === 'teacher' || userRole === 'admin') ? 'pointer' : 'default' }}
        >
          <div className="item-content">
            <h3>{lesson.lesson_title}</h3>
            <p>Grade: {lesson.grade}</p>
            <p>Duration: {lesson.duration} minutes</p>
            <p>Content Type: {lesson.content_type}</p>
            {lesson.content_url && <p>Content: Available</p>}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* ===== QUIZZES TAB ===== */}
{activeTab === 'quizzes' && (
  <div className="content-section">
    <div className="action-buttons">
      <button 
                  className="new-quiz-btn"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setEditingItem({ type: 'quiz', _id: 'new' });
                    setFormData({});
                    setVideoFile(null);
                    setContentType('youtube');
                    setLessonModal({ open: true, lesson: null });
                  }}
                >
                  Create New Quiz
                </button>
                <br></br>
                <br></br>
      {(userRole === 'teacher' || userRole === 'admin') && (
        
        <button
          className="delete-btn"
          onClick={() => setShowDeleteQuizModal(true)}
        >
          Delete Quizzes
        </button>
      )}
      
    </div>
    <h2>Quizzes</h2>
    <div className="items-list">
      {quizzes.map(quiz => (
        <div
          key={quiz._id}
          className="item-card"
          onClick={() => {
            if (userRole === 'teacher' || userRole === 'admin') {
              setEditingItem({ ...quiz, type: 'quiz' });
              setFormData({
                quiz_title: quiz.quiz_title,
                quiz_type: quiz.quiz_type,
                time_limit: quiz.time_limit,
                total_questions: quiz.total_questions,
              });
              setContentType(quiz.quiz_type || 'multiple-choice');
              setLessonModal({ open: true, lesson: quiz });
            }
          }}
          style={{ cursor: (userRole === 'teacher' || userRole === 'admin') ? 'pointer' : 'default' }}
        >
          <div className="item-content">
            <h3>{quiz.quiz_title}</h3>
            <p>Type: {quiz.quiz_type}</p>
            <p>Questions: {quiz.total_questions}</p>
            <p>Time Limit: {quiz.time_limit} minutes</p>

            {(userRole === 'teacher' || userRole === 'admin') && (
              <div className="quiz-actions">
                <div className="nav-icon icon-target center" onClick={(e) => { e.stopPropagation(); handleQuizStart(quiz._id); }}>
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" />
                    <circle cx="12" cy="12" r="5" fill="#180A29" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleManageQuestions(quiz); }}>
                  Manage Questions
                </button>
                
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* ===== LESSON MODAL ===== */}
{lessonModal.open && (
  <div className="modal-overlay" onClick={() => setLessonModal({ open: false, lesson: null })}>
    <div
      className="modal"
      ref={lessonModalRef}
      onClick={e => e.stopPropagation()}
    >
      <button
        className="modal-close"
        onClick={() => setLessonModal({ open: false, lesson: null })}
      >✕
      </button>

      <h2>{editingItem?._id === 'new' ? `Create ${editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}` : `Edit ${editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}`}</h2>

      <form
        onSubmit={e => {
          e.preventDefault();
          handleSave();
        }}
      >
        {editingItem.type === 'lesson' ? (
          <>
            <input
              type="text"
              name="lesson_title"
              value={formData.lesson_title || ''}
              onChange={handleInputChange}
              placeholder="Lesson Title"
              required
            />

            <textarea
              name="lesson_content"
              value={formData.lesson_content || ''}
              onChange={handleInputChange}
              placeholder="Lesson Content"
              required
            />

            <div className="form-group">
              <label>Content Type:</label>
              <select
                value={contentType}
                onChange={e => setContentType(e.target.value)}
              >
                <option value="youtube">YouTube</option>
                <option value="video">Video</option>
              </select>
            </div>

            {contentType === 'youtube' && (
              <input
                type="text"
                name="content_url"
                value={formData.content_url || ''}
                onChange={handleInputChange}
                placeholder="YouTube URL"
                required
              />
            )}

            {contentType === 'video' && (
              <>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                />
                {videoFile && <p>Selected file: {videoFile.name}</p>}
                {!videoFile && formData.content_url && (
                  <div>
                    <p>Current video:</p>
                    <video
                      src={`http://localhost:5000${formData.content_url}`}
                      controls
                      style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
                    />
                  </div>
                )}
              </>
            )}

            <input
              type="number"
              name="duration"
              value={formData.duration || ''}
              onChange={handleInputChange}
              placeholder="Duration (minutes)"
              required
            />

            {/* Lesson Card Image URL */}
            <div className="form-group">
              <label>Lesson Card Image URL:</label>
              <input
                type="text"
                name="image_url"
                value={formData.image_url || ''}
                onChange={handleInputChange}
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              />
              {formData.image_url && (
                <div>
                  <p>Preview:</p>
                  <img
                    src={formData.image_url}
                    alt="Lesson card preview"
                    style={{ width: '100%', maxWidth: '200px', height: 'auto' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=Invalid+Image+URL'; }}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              name="quiz_title"
              value={formData.quiz_title || ''}
              onChange={handleInputChange}
              placeholder="Quiz Title"
              required
            />

            <div className="form-group">
              <label>Quiz Type:</label>
              <select
                name="quiz_type"
                value={formData.quiz_type || 'multiple-choice'}
                onChange={handleInputChange}
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <input
              type="number"
              name="time_limit"
              value={formData.time_limit || ''}
              onChange={handleInputChange}
              placeholder="Time Limit (minutes)"
              required
            />

            <input
              type="number"
              name="total_questions"
              value={formData.total_questions || ''}
              onChange={handleInputChange}
              placeholder="Total Questions"
              required
            />
          </>
        )}

        <div className="form-actions">
          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Save'}
          </button>
          <button type="button" onClick={() => setLessonModal({ open: false, lesson: null })}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* ===== RECYCLE BIN TAB ===== */}
{activeTab === 'recycle-bin' && (
  <div className="recycle-bin-container">
    <h2>Deleted Items</h2>

    <div className="recycle-tabs">
      <button
        className={recycleBinTab === 'lessons' ? 'active' : ''}
        onClick={() => setRecycleBinTab('lessons')}
      >
        Deleted Lessons ({deletedLessons.length})
      </button>
      <button
        className={recycleBinTab === 'quizzes' ? 'active' : ''}
        onClick={() => setRecycleBinTab('quizzes')}
      >
        Deleted Quizzes ({deletedQuizzes.length})
      </button>
    </div>

    {recycleBinTab === 'lessons' && (
      <div className="items-list">
        {deletedLessons.length === 0 ? (
          <p>No deleted lessons</p>
        ) : (
          deletedLessons.map(lesson => (
            <div key={lesson._id} className="item-card deleted-item">
              <h3>{lesson.lesson_title}</h3>
              <p>Grade: {lesson.grade}</p>
              <button onClick={() => handleRestore(lesson._id, 'lesson')}>
                Restore
              </button>
              {userRole === 'admin' && (
                <button onClick={() => handlePermanentDelete(lesson._id, 'lesson')}>
                  Delete Permanently
                </button>
              )}
            </div>
          ))
        )}
      </div>
    )}

    {recycleBinTab === 'quizzes' && (
      <div className="items-list">
        {deletedQuizzes.length === 0 ? (
          <p>No deleted quizzes</p>
        ) : (
          deletedQuizzes.map(quiz => (
            <div key={quiz._id} className="item-card deleted-item">
              <h3>{quiz.quiz_title}</h3>
              <p>Grade: {quiz.grade}</p>
              <button onClick={() => handleRestore(quiz._id, 'quiz')}>
                Restore
              </button>
              {userRole === 'admin' && (
                <button onClick={() => handlePermanentDelete(quiz._id, 'quiz')}>
                  Delete Permanently
                </button>
              )}
            </div>
          ))
        )}
      </div>
    )}
  </div>
)}

{/* ===== QUESTION MANAGEMENT MODAL ===== */}
{showQuestionModal && (
  <div className="modal-overlay" onClick={() => setShowQuestionModal(false)}>
    <div
      className="modal question-modal"
      onClick={e => e.stopPropagation()}
    >
      <button
        className="modal-close"
        onClick={() => setShowQuestionModal(false)}
      >
        ✕
      </button>

      <h2>Manage Questions for {editingItem?.quiz_title}</h2>

      <div className="question-management">
        {/* Question Form */}
        {editingQuestion && (
          <div className="question-form-section">
            <h3>{editingQuestion._id === 'new' ? 'Create New Question' : 'Edit Question'}</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveQuestion(); }}>
              <div className="form-group">
                <label>Question Text:</label>
                <textarea
                  name="question_text"
                  value={questionFormData.question_text || ''}
                  onChange={handleQuestionInputChange}
                  placeholder="Enter question text"
                  required
                  autoFocus={editingQuestion?._id === 'new'}
                />
              </div>

              <div className="form-group">
                <label>Question Type:</label>
                <select
                  name="question_type"
                  value={questionFormData.question_type || 'multiple-choice'}
                  onChange={handleQuestionInputChange}
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="short-answer">Short Answer</option>
                </select>
              </div>

              {(questionFormData.question_type === 'multiple-choice' || !questionFormData.question_type) && (
                <div className="form-group">
                  <label>Options:</label>
                  {questionOptions.map((option, index) => (
                    <div key={index} className="option-input">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {questionOptions.length > 1 && (
                        <button type="button" onClick={() => removeOption(index)} className="remove-option-btn">
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addOption} className="add-option-btn">
                    Add Option
                  </button>
                </div>
              )}

              <div className="form-group">
                <label>Correct Answer:</label>
                <input
                  type="text"
                  name="correct_answer"
                  value={questionFormData.correct_answer || ''}
                  onChange={handleQuestionInputChange}
                  placeholder="Enter correct answer"
                  required
                />
              </div>

              <div className="form-group">
                <label>Difficulty Level:</label>
                <select
                  name="difficulty_level"
                  value={questionFormData.difficulty_level || 'easy'}
                  onChange={handleQuestionInputChange}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label>Points Value:</label>
                <input
                  type="number"
                  name="points_value"
                  value={questionFormData.points_value || 1}
                  onChange={handleQuestionInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={uploading}>
                  {uploading ? 'Saving...' : 'Save Question'}
                </button>
                <button type="button" onClick={handleCancelEditQuestion} disabled={uploading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="current-questions">
          <h3>Current Questions ({quizQuestions.length})</h3>
          <button onClick={handleCreateQuestion} className="create-question-btn">
            Create New Question
          </button>
          <div className="questions-list">
            {quizQuestions.length === 0 ? (
              <p>No questions added yet</p>
            ) : (
              quizQuestions.map(questionId => {
                const question = allQuestions.find(q => q._id === questionId);
                return question ? (
                  <div key={questionId} className="question-item">
                    <div className="question-content" onClick={() => handleEditQuestion(question)}>
                      <p><strong>{question.question_text}</strong></p>
                      <p>Type: {question.question_type} | Difficulty: {question.difficulty_level} | Points: {question.points_value}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveQuestionFromQuiz(questionId)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                ) : null;
              })
            )}
          </div>
        </div>


      </div>

      <div className="modal-actions">
        <button onClick={() => setShowQuestionModal(false)}>
          Close
        </button>
      </div>
    </div>
  </div>
)}

{/* ===== DELETE LESSON MODAL ===== */}
{showDeleteModal && (
  <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
      <h2>Select Lesson to Delete</h2>
      <div className="delete-lesson-list">
        {lessons.map(lesson => (
          <div key={lesson._id} className="delete-lesson-item">
            <input
              type="radio"
              name="lessonToDelete"
              value={lesson._id}
              checked={selectedLessonToDelete?._id === lesson._id}
              onChange={() => setSelectedLessonToDelete(lesson)}
            />
            <label>{lesson.lesson_title}</label>
          </div>
        ))}
      </div>
      <div className="modal-actions">
        <button onClick={handleDeleteLesson} disabled={!selectedLessonToDelete}>Delete</button>
        <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}

{/* ===== DELETE QUIZ MODAL ===== */}
{showDeleteQuizModal && (
  <div className="modal-overlay" onClick={() => setShowDeleteQuizModal(false)}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setShowDeleteQuizModal(false)}>✕</button>
      <h2>Select Quiz to Delete</h2>
      <div className="delete-quiz-list">
        {quizzes.map(quiz => (
          <div key={quiz._id} className="delete-quiz-item">
            <input
              type="radio"
              name="quizToDelete"
              value={quiz._id}
              checked={selectedQuizToDelete?._id === quiz._id}
              onChange={() => setSelectedQuizToDelete(quiz)}
            />
            <label>{quiz.quiz_title}</label>
          </div>
        ))}
      </div>
      <div className="modal-actions">
        <button onClick={handleDeleteQuiz} disabled={!selectedQuizToDelete}>Delete</button>
        <button onClick={() => setShowDeleteQuizModal(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default ManageContent;
