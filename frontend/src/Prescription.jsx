import React, { useState } from "react";
import Header from "./Components/Header/Header";
import NavBar from "./Components/NavBar/NavBar";
import Footer from "./Components/Footer/Footer";
import axios from "axios";
import Cookies from "js-cookie"; // Assuming you're using cookies for user authentication
import "./Prescription.css"; // Import the CSS file for styling
import { useNavigate } from "react-router-dom";

function Prescription() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result.split(",")[1]); // Get base64 encoded string
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = Cookies.get("user") || sessionStorage.getItem("user");
    if (!user) {
        alert("You must be logged in to submit a prescription.");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
        return;
      }      

    const userData = JSON.parse(user);
    const userId = userData.id;

    try {
      const response = await axios.post(
        "http://localhost:8081/add-prescription",
        {
          id_user: userId,
          image_prescription: image,
          description_prescription: description,
        }
      );

      if (response.status === 201) {
        alert("Thank you for submitting your prescription, we will contact you soon !");
        setDescription("");
        setImage(null);
      }
    } catch (error) {
      console.error("Error submitting prescription:", error);
      alert("There was an error submitting your prescription.");
    }
  };

  return (
    <div className="prescription-page">
      <Header />
      <NavBar />
      <div id="page-container">
        <form className="prescription-form" onSubmit={handleSubmit}>
          <h1>Upload a Prescription</h1>
          <div className="form-group">
            <label htmlFor="prescription-image">Upload Image:</label>
            <input
              type="file"
              id="prescription-image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="prescription-description">Description:</label>
            <textarea
              id="prescription-description"
              className="prescription-textarea"
              placeholder="Write your prescription description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
            ></textarea>
          </div>
          <button type="submit" className="prescription-button">
            Submit
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Prescription;
