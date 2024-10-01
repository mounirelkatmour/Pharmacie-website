import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SeePrescriptions.css"; // Import your CSS file

function SeePrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axios.get("http://localhost:8081/prescriptions");
        setPrescriptions(response.data);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      }
    };

    fetchPrescriptions();
  }, []);

  return (
    <div id="prescriptions-page-container" className="d-flex flex-column align-items-center">
      <h1 id="prescriptions-page-title">User Prescriptions</h1>
      <div id="prescriptions-cards-container" className="d-flex flex-wrap justify-content-center">
        {prescriptions.map((prescription) => (
          <div key={prescription.id_prescription} className="prescription-card card m-3" style={{ width: "18rem" }}>
            <div className="card-body">
              <h5 className="card-title">Username: {prescription.username_user}</h5>
              <p className="card-text">City: {prescription.city_user}</p>
              <p className="card-text">Phone: {prescription.phone_user}</p>
              <a
                href={`data:image/jpeg;base64,${prescription.image_prescription}`}
                download={`prescription_${prescription.id_prescription}.jpg`}
                className="btn btn-info"
              >
                Download Prescription
              </a>
              {prescription.image_prescription && (
                <img
                  src={`data:image/jpeg;base64,${prescription.image_prescription}`}
                  alt="Prescription"
                  className="img-fluid mt-2"
                />
              )}
              <p className="card-text mt-2">{prescription.description_prescription}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SeePrescriptions;
