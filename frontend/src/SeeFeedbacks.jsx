import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SeeFeedbacks.css";

function SeeFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/feedbacks")
      .then((res) => {
        setFeedbacks(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div id="feedbacks-page" className="d-flex flex-column align-items-center">
      <h1 id="feedbacks-title">User Feedbacks</h1>
      <div id="feedbacks-container" className="d-flex flex-wrap justify-content-center">
        {feedbacks.map((feedback, index) => (
          <div key={index} className="feedback-card">
            <h2 className="feedback-username">{feedback.username_user}</h2>
            <p className="feedback-city">City: {feedback.city_user}</p>
            <p className="feedback-phone">Phone: {feedback.phone_user}</p>
            <div className="feedback-text">
              <p>{feedback.text_feedback}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SeeFeedbacks;
