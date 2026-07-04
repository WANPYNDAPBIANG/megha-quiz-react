import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import { BookOpen, GraduationCap, ChevronRight, LayoutGrid } from "lucide-react";

function Practice() {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  // Core UI Control States
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [topics, setTopics] = useState([]);
  const [activeCategory, setActiveCategory] = useState("MPSC");
  const [loading, setLoading] = useState(false);

    // Fetch all exams on component mount
  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Sanitize the URL dynamically to clean up any accidental double slashes
        const targetUrl = `${backendUrl}/api/quiz/exams`.replace(/([^:]\/)\/+/g, "$1");
        
        const response = await axios.get(targetUrl, {
          withCredentials: true // Enforces your backend cookie/CORS credential policy rules
        });
        
        if (response.data.success) {
          setExams(response.data.data);
        }
      } catch (error) {
        console.error("Error loading exams:", error);
        toast.error("Failed to load exam categories from database.");
      }
    };
    fetchExams();
  }, [backendUrl]);

  // Fetch specific topics whenever a user picks an exam card
  const handleExamSelect = async (exam) => {
    setSelectedExam(exam);
    setTopics([]);
    setLoading(true);
    try {
      // Sanitize sub-tier topic endpoint strings safely
      const targetUrl = `${backendUrl}/api/quiz/exams/${exam._id}/topics`.replace(/([^:]\/)\/+/g, "$1");
      
      const response = await axios.get(targetUrl, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setTopics(response.data.data);
      }
    } catch (error) {
      console.error("Error loading topics:", error);
      toast.error("Could not retrieve topics for this exam.");
    } finally {
      setLoading(false);
    }
  };

  // Filter exams matching top layout row tab categories
  const displayedExams = exams.filter(e => e.category === activeCategory);

  return (
    <div className="fullstack-practice-dashboard">
      <div className="practice-hero-banner">
        <h1>Dynamic Practice Portal</h1>
        <p>Select your targeted state exam category, choose an exam, and pick a topic to launch your session.</p>
      </div>

      <div className="practice-container">
        {/* STEP 1: CATEGORY TABS SELECTOR */}
        <div className="category-tabs-row">
          {["MPSC", "MPSC LDA", "Police", "TET", "Secretariat"].map((cat) => (
            <button
              key={cat}
              className={`cat-tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedExam(null); // Reset lower tier trees on switch
                setTopics([]);
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="dashboard-split-grid">
          {/* STEP 2: AVAILABLE EXAMS LISTING COLUMN */}
          <div className="exams-column">
            <h2><GraduationCap size={20} /> Available Exams ({activeCategory})</h2>
            <div className="exams-list-container">
              {displayedExams.length > 0 ? (
                displayedExams.map((exam) => (
                  <div 
                    key={exam._id} 
                    className={`exam-selection-card ${selectedExam?._id === exam._id ? "selected" : ""}`}
                    onClick={() => handleExamSelect(exam)}
                  >
                    <div>
                      <h3>{exam.name}</h3>
                      <p>{exam.description}</p>
                    </div>
                    <ChevronRight size={18} className="arrow-icon" />
                  </div>
                ))
              ) : (
                <p className="empty-prompt">No active exams configured for this category yet.</p>
              )}
            </div>
          </div>

          {/* STEP 3: TOPICS DISPLAY COLUMN */}
          <div className="topics-column">
            <h2><BookOpen size={20} /> Exam Topics & Subjects</h2>
            
            {!selectedExam ? (
              <div className="placeholder-info-box">
                <LayoutGrid size={32} />
                <p>Please select an exam from the left panel to display available quiz modules.</p>
              </div>
            ) : loading ? (
              <p className="loading-text">Fetching topics from Atlas database...</p>
            ) : (
              <div className="topics-grid-layout">
                {topics.length > 0 ? (
                  topics.map((topic) => (
                    <div key={topic._id} className="topic-launch-card">
                      <h3>{topic.title}</h3>
                      <p><strong>{topic.questionCount || 0}</strong> MCQ questions available</p>
                      
                      <div className="action-buttons-row">
                        {/* FIXED: Keeps routing matches clean across modules */}
                        <button 
                          className="btn-action practice-mode-btn"
                          onClick={() => navigate(`/quiz?mode=practice&topicId=${topic._id}`)}
                        >
                          Practice Mode
                        </button>
                        <button 
                          className="btn-action mock-mode-btn"
                          onClick={() => navigate(`/quiz?mode=mock&topicId=${topic._id}`)}
                        >
                          Mock Test
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-prompt">No topics uploaded for this exam model yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Practice;
