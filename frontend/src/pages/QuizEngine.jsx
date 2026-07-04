import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Info, FileText, Video, CheckCircle2, XCircle } from "lucide-react";
import { AppContext } from "../context/AppContext.jsx";

const QuizEngine = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, userData } = useContext(AppContext);

  // Parse parameters straight from the browser URL path string
  const queryParams = new URLSearchParams(location.search);
  const quizMode = queryParams.get("mode") || "practice";
  const topicId = queryParams.get("topicId");

  const isMockMode = () => quizMode === "mock";
  const isPracticeMode = () => quizMode === "practice";

  // ==========================================================================
  // STATE DEFINITIONS
  // ==========================================================================
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour time tracking
  const [showResultsSection, setShowResultsSection] = useState(false);
  const [resultsData, setResultsData] = useState({
    total: 0,
    correct: 0,
    wrong: 0,
    accuracy: "0%",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTooltipId, setActiveTooltipId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const timerIntervalRef = useRef(null);

  // ==========================================================================
  // FETCH QUESTIONS LIVE FROM MONGODB ATLAS
  // ==========================================================================
  useEffect(() => {
    const fetchLiveQuestions = async () => {
      if (!topicId) {
        toast.error("Invalid Exam Topic reference pointer.");
        navigate("/practice");
        return;
      }

      setIsLoading(true);
      try {
        // Querying the active backend express server endpoint we registered
        const response = await axios.get(
          `${backendUrl}/api/quiz/topics/${topicId}/questions`,
        );

        if (response.data.success && response.data.data.length > 0) {
          setQuestions(response.data.data);
        } else {
          toast.warning("This exam subject has no questions uploaded yet.");
          navigate("/practice");
        }

        // Adjust tab metadata titles dynamically
        document.title = isMockMode()
          ? "Mock Test | Megha Quiz App"
          : "Practice Mode | Megha Quiz App";

        // Re-hydrate session local user tracking caches
        const cachedAnswers = localStorage.getItem(`userAnswers_${topicId}`);
        const cachedBookmarks = localStorage.getItem("bookmarks");
        if (cachedAnswers) setUserAnswers(JSON.parse(cachedAnswers));
        if (cachedBookmarks) setBookmarks(JSON.parse(cachedBookmarks));
      } catch (err) {
        console.error("API Retrieval Failure:", err);
        toast.error("Failed to connect to fullstack database clusters.");
        navigate("/practice");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveQuestions();
  }, [backendUrl, topicId, quizMode, navigate]);

  // ==========================================================================
  // COUNTDOWN TEST CLOCK CONTROLLER (MOCK EXCLUSIVE)
  // ==========================================================================
  useEffect(() => {
    if (
      !isMockMode() ||
      questions.length === 0 ||
      showResultsSection ||
      isLoading
    )
      return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerIntervalRef.current);
          alert("Time is up! Test submitted automatically.");
          executeShowResults(userAnswers);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [questions, showResultsSection, userAnswers, isLoading]);

  const formatTimer = () => {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // ==========================================================================
  // ACTION LOGIC CONTROLLERS
  // ==========================================================================
  const handleSelectAnswer = (selectedIndex) => {
    if (showResultsSection) return;
    if (isPracticeMode() && userAnswers[currentQuestionIndex] !== undefined)
      return;

    const updatedAnswers = {
      ...userAnswers,
      [currentQuestionIndex]: selectedIndex,
    };

    setUserAnswers(updatedAnswers);
    localStorage.setItem(
      `userAnswers_${topicId}`,
      JSON.stringify(updatedAnswers),
    );
  };

  const handleToggleBookmark = () => {
    const activeQuestionId =
      questions[currentQuestionIndex]?._id || currentQuestionIndex;
    let updatedBookmarks;

    if (bookmarks.includes(activeQuestionId)) {
      updatedBookmarks = bookmarks.filter((id) => id !== activeQuestionId);
    } else {
      updatedBookmarks = [...bookmarks, activeQuestionId];
    }

    setBookmarks(updatedBookmarks);
    localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
  };

  const handleNextBtnClick = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmitPractice();
    }
  };

  const handleSubmitPractice = () => {
    const msg = isMockMode() ? "Submit Mock Test?" : "Submit Practice?";
    if (!window.confirm(msg)) return;
    executeShowResults(userAnswers);
  };

  const executeShowResults = async (answersToEvaluate) => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    questions.forEach((q, i) => {
      const a = answersToEvaluate[i];
      if (a === undefined) unanswered++;
      else if (a === q.correctAnswer) correct++;
      else wrong++;
    });

    const attempted = correct + wrong;
    const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;

    setResultsData({
      total: questions.length,
      correct,
      wrong,
      accuracy: `${accuracy}%`,
    });

    localStorage.setItem("correctAnswers", correct);
    localStorage.setItem("wrongAnswers", wrong);
    localStorage.setItem("accuracy", accuracy);
    localStorage.setItem("unansweredQuestions", unanswered);

    setIsSubmitted(true);
    setShowResultsSection(true);

    try {
      const targetUrl = `${backendUrl}/api/quiz/leaderboard/submit`.replace(
        /([^:]\/)\/+/g,
        "$1",
      );
      await axios.post(
        targetUrl,
        {
          userId: userData?._id, // Context auth tokens
          userName: userData?.name || "Guest User",
          topicTitle: questions[0]?.topicTitle || "State Mock Assessment",
          score: correct,
          totalQuestions: questions.length,
          accuracy: accuracy,
        },
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Failed to post leaderboard payload:", err);
    }
  };

  const handleResetQuizData = () => {
    localStorage.removeItem(`userAnswers_${topicId}`);
    window.location.reload();
  };

  const currentAttemptedCount = Object.keys(userAnswers).filter(
    (k) => userAnswers[k] !== undefined,
  ).length;
  const currentUnansweredCount = questions.length - currentAttemptedCount;
  const progressPercent = questions.length
    ? (currentAttemptedCount / questions.length) * 100
    : 0;

  const activeQuestion = questions[currentQuestionIndex];
  const activeUserSelection = userAnswers[currentQuestionIndex];
  const isQuestionBookmarked = bookmarks.includes(activeQuestion?._id);

  if (isLoading) {
    return (
      <div
        className="placeholder-info-box"
        style={{ margin: "100px auto", maxWidth: "600px" }}
      >
        <p>
          Loading exam metrics... Processing data streams from MongoDB Atlas...
        </p>
      </div>
    );
  }

  return (
    <div className="quiz-engine-page-wrapper">
      {!isSubmitted ? (
        <main className="practice-layout" id="quizLayout">
          {/* PALETTE NAVIGATION SIDEBAR */}
          <aside className="question-sidebar" id="questionSidebar">
            <div className="sidebar-header">
              <h2>Question Palette</h2>
            </div>

            <div className="candidate-info">
              <h3>Candidate</h3>
              <p id="candidateName">{userData?.name || "Guest User"}</p>
            </div>

            <div className="question-summary">
              <div className="summary-item">
                <span id="answeredCount" className="summary-count">
                  {currentAttemptedCount}
                </span>
                <span>Answered</span>
              </div>
              <div className="summary-item">
                <span id="unansweredCount" className="summary-count">
                  {currentUnansweredCount}
                </span>
                <span>Unanswered</span>
              </div>
              <div className="summary-item">
                <span id="bookmarkCount" className="summary-count">
                  {bookmarks.length}
                </span>
                <span>Bookmarked</span>
              </div>
            </div>

            <div id="questionPalette" className="question-palette">
              {questions.map((_, i) => {
                let btnClass = "question-number";
                if (i === currentQuestionIndex) btnClass += " current";
                if (userAnswers[i] !== undefined) btnClass += " attempted";

                return (
                  <button
                    key={i}
                    type="button"
                    className={btnClass}
                    onClick={() => setCurrentQuestionIndex(i)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="palette-legend">
              <div>
                <span className="legend-box unanswered"></span>Unanswered
              </div>
              <div>
                <span className="legend-box attempted"></span>Answered
              </div>
              <div>
                <span className="legend-box current-view"></span>Current
              </div>
            </div>

            <button
              id="submitPracticeBtn"
              className="submit-practice-btn"
              onClick={handleSubmitPractice}
            >
              {isMockMode() ? "Submit Test" : "Submit Practice"}
            </button>
          </aside>

          {/* EXAM CORE CARD PLATFORM */}
          <section className="quiz-section">
            <header className="exam-header">
              <div className="quiz-info">
                <span id="questionCounter">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              {isMockMode() && (
                <div id="timerContainer" className="timer-container">
                  <span className="timer-label">Time</span>
                  <span id="timer">{formatTimer()}</span>
                </div>
              )}
            </header>

            <div className="question-status">
              Status:{" "}
              <strong id="questionStatus">
                {activeUserSelection !== undefined
                  ? "Answered"
                  : "Not Attempted"}
              </strong>
            </div>

            <article className="question-card">
              <div className="question-header">
                <h2 id="questionTitle">Question {currentQuestionIndex + 1}</h2>
                {isPracticeMode() && (
                  <button
                    id="bookmarkBtn"
                    className={isQuestionBookmarked ? "bookmarked" : ""}
                    onClick={handleToggleBookmark}
                  >
                    {isQuestionBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
                  </button>
                )}
              </div>

              <div id="questionText">{activeQuestion?.question}</div>

              {activeQuestion?.questionImage && (
                <div className="question-image-container">
                  <img
                    id="questionImage"
                    src={activeQuestion.questionImage}
                    alt="Figure Model Graph Reference"
                  />
                </div>
              )}
            </article>

            {/* SELECTION BUTTON OPTIONS */}
            <section id="optionsContainer" className="options-section">
              {activeQuestion?.options.map((opt, index) => {
                let optionClass = "option-btn";
                const isSelected = activeUserSelection === index;

                // 🌟 THE EXAM MODE FIX: Mock stays gray, Practice highlights instantly
                if (isPracticeMode() && activeUserSelection !== undefined) {
                  if (index === activeQuestion.correctAnswer)
                    optionClass += " correct-answer";
                  else if (isSelected) optionClass += " wrong-answer";
                } else if (isMockMode() && isSelected) {
                  optionClass += " selected-option";
                }

                return (
                  <button
                    key={index}
                    type="button"
                    className={optionClass}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={
                      isPracticeMode() && activeUserSelection !== undefined
                    }
                  >
                    {opt}
                  </button>
                );
              })}
            </section>

            {isPracticeMode() && activeUserSelection !== undefined && (
              <section
                id="solutionContainer"
                className="solution-container"
                style={{ display: "block" }}
              >
                <h3>Solution & Explanation</h3>
                <p>{activeQuestion?.explanation}</p>
              </section>
            )}

            <div className="question-navigation">
              <button
                id="prevBtn"
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button id="nextBtn" onClick={handleNextBtnClick}>
                {currentQuestionIndex === questions.length - 1
                  ? isMockMode()
                    ? "Submit Test"
                    : "Submit Practice"
                  : "Next"}
              </button>
            </div>
          </section>
        </main>
      ) : (
        <main className="results-review-dashboard">
          {/* STATS OVERVIEW HEADER */}
          <section
            className="results-section"
            style={{ margin: "0 auto 40px auto" }}
          >
            <h2>{isMockMode() ? "Mock Test Summary" : "Practice Summary"}</h2>
            <div className="results-grid">
              <div className="result-card">
                <h3>Total Questions</h3>
                <p>{resultsData.total}</p>
              </div>
              <div className="result-card">
                <h3>Correct</h3>
                <p>{resultsData.correct}</p>
              </div>
              <div className="result-card">
                <h3>Wrong</h3>
                <p>{resultsData.wrong}</p>
              </div>
              <div className="result-card">
                <h3>Accuracy</h3>
                <p>{resultsData.accuracy}</p>
              </div>
            </div>
            <button
              id="restartBtn"
              style={{ maxWidth: "250px", margin: "0 auto" }}
              onClick={() => navigate("/practice")}
            >
              Finish & Exit
            </button>
          </section>

          {/* CHRONOLOGICAL QUESTION EVALUATION REVIEW FEED */}
          <div className="review-feed-container">
            <h2>Detailed Evaluation Review</h2>
            {questions.map((q, idx) => {
              const selectedAns = userAnswers[idx];
              const isCorrect = selectedAns === q.correctAnswer;
              const isTooltipOpen = activeTooltipId === q._id;

              return (
                <div
                  key={q._id || idx}
                  className={`review-card-row ${isCorrect ? "border-correct" : "border-incorrect"}`}
                >
                  <div className="review-card-header">
                    <div className="review-question-text">
                      <span className="q-number-indicator">Q{idx + 1}</span>
                      <h3>{q.question}</h3>

                      {/* TOOLTIP "(i)" BUTTON */}
                      <button
                        type="button"
                        className="info-tooltip-trigger"
                        onClick={() =>
                          setActiveTooltipId(isTooltipOpen ? null : q._id)
                        }
                      >
                        <Info size={18} />
                      </button>

                      {/* SCROLLABLE TOOLTIP POPUP */}
                      {isTooltipOpen && (
                        <div className="explanation-tooltip-popover">
                          <div className="tooltip-header">
                            <h4>Solution Explanation</h4>
                            <button
                              className="tooltip-close"
                              onClick={() => setActiveTooltipId(null)}
                            >
                              ×
                            </button>
                          </div>
                          <div className="tooltip-scroll-body">
                            <p>{q.explanation}</p>

                            {/* DYNAMIC HIDDEN LEARNING CHANNELS BUTTONS */}
                            {(q.pdfNotesUrl || q.videoExplanationUrl) && (
                              <div className="tooltip-resources-section">
                                <h5>Review Learning Resources:</h5>
                                <div className="resource-buttons-row">
                                  {q.pdfNotesUrl && (
                                    <a
                                      href={q.pdfNotesUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="res-btn btn-drive"
                                    >
                                      <FileText size={14} /> Open Notes
                                    </a>
                                  )}
                                  {q.videoExplanationUrl && (
                                    <a
                                      href={q.videoExplanationUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="res-btn btn-youtube"
                                    >
                                      <Video size={14} /> Watch Video
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="review-status-pill">
                      {isCorrect ? (
                        <span className="pill-status pass">
                          <CheckCircle2 size={16} /> Correct
                        </span>
                      ) : (
                        <span className="pill-status fail">
                          <XCircle size={16} /> Incorrect
                        </span>
                      )}
                    </div>
                  </div>

                  {/* DISPLAY CARD CHOICE ROWS */}
                  {q.options.map((optStr, optIdx) => {
                    const isUserSelection = optIdx === selectedAns;
                    const isCorrectChoice = optIdx === q.correctAnswer;
                    const optionClasses = [
                      "review-opt-box",
                      isCorrectChoice ? "correct-answer" : "",
                      isUserSelection && !isCorrectChoice ? "user-wrong" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <div key={optIdx} className={optionClasses}>
                        <span className="option-label">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="option-text">{optStr}</span>
                        {isCorrectChoice && (
                          <span className="option-badge correct">
                            Correct Answer
                          </span>
                        )}
                        {isUserSelection && !isCorrectChoice && (
                          <span className="option-badge selected">
                            Your Selection
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </main>
      )}
    </div>
  );
};

export default QuizEngine;
