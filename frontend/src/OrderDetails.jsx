// OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./OrderDetails.css"; // Import your CSS file

function OrderDetails() {
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState([]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/order-details/${id}`);
        setOrderDetails(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrderDetails();
  }, [id]);

  return (
    <div id="order-details-page-container">
      <h1 id="order-details-page-title">Order Details</h1>
      <div className="order-details-list">
        {orderDetails.map((detail) => (
          <div key={detail.ID_ORDERDETAIL} className="order-detail-card">
            <p className="product-id">Product ID: {detail.ID_PRODUCT}</p>
            <p className="quantity">Quantity: {detail.QUANTITY_PRODUCT}</p>
            <p className="price">Price: {detail.PRICE}DH</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderDetails;
