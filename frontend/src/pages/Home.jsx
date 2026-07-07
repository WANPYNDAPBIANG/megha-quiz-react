import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Practice from "./Practice";
import { Link } from "react-router-dom";

function Home() {
  const [examAuthorities, setExamAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. New state variable to track "Show More" visibility
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // FIX: Kept Vite's environment variable syntax to prevent crashes
    const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    
    const fetchExamAuthorities = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/authorities`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setExamAuthorities(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExamAuthorities();
  }, []);

  const appFeatures = [
    { id: 1, title: "Practice Questions", desc: "Unlimited practice mode." },
    { id: 2, title: "Mock Tests", desc: "Exam simulation with timer." },
    { id: 3, title: "Bookmarks", desc: "Save important questions." },
    { id: 4, title: "Progress Tracking", desc: "Monitor your improvement." },
    { id: 5, title: "Current Affairs", desc: "Daily updated quizzes." },
    { id: 6, title: "Previous Papers", desc: "Practice previous year questions." }
  ];

  const quickAccess = [
    { id: 1, links: "daily-quiz", heading: "Daily Quiz", paragraph: "Challenge Yourself Today" },
    { id: 2, links: "bookmarks", heading: "Bookmarks", paragraph: "Review your Mistakes" },
    { id: 3, links: "leaderboard", heading: "Leaderboard", paragraph: "Challenge Yourself With Others" },
    { id: 4, links: "dashboard", heading: "Dashboard", paragraph: "View Your Profile and Perfomance" }
  ];

  // 2. Slice the array dynamically based on state condition
  const displayedAuthorities = showAll ? examAuthorities : examAuthorities.slice(0, 6);

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <Hero 
        title="Meghalaya Government Exam Preparation Platform"
        subtitle="Practice MPSC, DSC, Meghalaya Police, TET, Secretariat and other competitive examinations with thousands of questions."
        primaryBtnText="Start Practice"
        primaryBtnLink="/practice"
        secondaryBtnText="Take Mock Test"
        secondaryBtnLink="/mock-test"
      />

      {/* EXAM AUTHORITIES WITH LOADING AND ERROR HANDLING */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Exam Authorities</h2>
          
          {loading && <div className="loading-state">Loading Exam Authorities...</div>}
          
          {error && <div className="error-state">Failed to load authorities: {error}</div>}
          
          {!loading && !error && (
            <>
              {/* Render sliced array instead of full array */}
              <div className="card-grid">
                {displayedAuthorities.map((authority) => (
                  <Link to="/practice"
                  state={{ targetCategory: authority.shortName }}
                  className="card card-link" 
                  key={authority._id}
                  style={{textDecoration: 'none', color: 'inherit', display: 'block'
                  }}>
                    <h3>{authority.shortName || "No Short Name"}</h3>
                    <h4>{authority.name || "No Full Name"}</h4>
                    <p className="badge">{authority.type || "N/A"}</p>
              </Link>
                ))}
              </div>

              {/* 3. Conditional rendering: Show toggle button only if total cards > 6 */}
              {examAuthorities.length > 6 && (
                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                  <button 
                    onClick={() => setShowAll(!showAll)} 
                    className="btn btn-primary"
                    style={{ padding: "0.75rem 1.5rem", cursor: "pointer" }}
                  >
                    {showAll ? "Show Less" : "Show More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="card-grid">
            {appFeatures.map((category) => (
              <div className="card" key={category.id}>
                <h3>{category.title}</h3>
                <p>{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Quick Access</h2>
          <div className="card-grid"> 
            {quickAccess.map((category) => (
              <Link to={`/${category.links}`} className="card" key={category.id}>
                <h3>{category.heading}</h3>
                <p>{category.paragraph}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
