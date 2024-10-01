import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SeeOrders.css"; // Import your CSS file

function SeeOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:8081/see-orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderClick = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };

  return (
    <div id="orders-page-container">
      <h1 id="orders-page-title">All Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <div
            key={order.ID_ORDER}
            className="order-card"
            onClick={() => handleOrderClick(order.ID_ORDER)}
          >
            <h5 className="order-id">Order ID: {order.ID_ORDER}</h5>
            <p className="order-user">User: {order.username_user}</p>
            <p className="order-price">Price: {order.PRICE_ORDER} DH</p>
            <p className="order-date">Date: {new Date(order.DATE_ORDER).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SeeOrders;
