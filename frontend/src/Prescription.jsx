import React, { useState } from "react";
import Swal from "sweetalert2";
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
      setImage(reader.result.split(",")[1]);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const user = Cookies.get("user") || sessionStorage.getItem("user");
    
    if (!user) {
      Swal.fire({
        title: "Error",
        text: "You must be logged in to submit a prescription.",
        icon: "error",
        confirmButtonColor: "#009900", // Match page theme
      });
  
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }
  
    // Check if the prescription image is null
    if (!image) {
      Swal.fire({
        title: "Error",
        text: "Please upload a prescription image before submitting.",
        icon: "error",
        confirmButtonColor: "#009900", // Match page theme
      });
      return;
    }
  
    const userData = JSON.parse(user);
    const userId = userData.id;
  
    try {
      const response = await axios.post("http://localhost:8081/add-prescription", {
        id_user: userId,
        image_prescription: image,
        description_prescription: description,
      });
  
      if (response.status === 201) {
        Swal.fire({
          title: "Success!",
          text: "Thank you for submitting your prescription, we will contact you soon!",
          icon: "success",
          confirmButtonColor: "#009900", // Match page theme
        });
        setDescription("");
        setImage(null); // Reset the image after success
      }
    } catch (error) {
      console.error("Error submitting prescription:", error);
      Swal.fire({
        title: "Error",
        text: "There was an error submitting your prescription.",
        icon: "error",
        confirmButtonColor: "#009900", // Match page theme
      });
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
