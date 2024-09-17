import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProductModal.css";
import Cookies from "js-cookie"; 
import { useNavigate } from "react-router-dom";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const ProductModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(product.PRICE_PRODUCT);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    setTotalPrice(product.PRICE_PRODUCT * quantity);
  }, [quantity, product.PRICE_PRODUCT]);

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  const handleAddToCart = async () => {
    const user = Cookies.get("user") || sessionStorage.getItem("user");
    if (!user) {
      navigate("/login");
    } else {
      try {
        const userData = JSON.parse(user);
        const userId = userData.id;

        // Ensure product.ID_PRODUCT is defined
        if (!product.ID_PRODUCT) {
          throw new Error("Product ID is missing.");
        }

        // Send request to add product to cart
        await axios.post("http://localhost:8081/add-to-cart", {
          id_product: product.ID_PRODUCT,
          id_user: userId,
          quantity_product: quantity
        });

        alert("Product added to cart successfully!");
        onClose(); // Close the modal after adding to cart
      } catch (err) {
        console.error("Error adding product to cart:", err);
        alert("Error adding product to cart.");
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          className="close-button"
          onClick={() => {
            console.log("Close button clicked"); // Debugging line
            onClose();
          }}
        >
          ×
        </button>
        <div className="modal-body">
          <div className="modal-image">
            <img
              src={
                product.IMAGE_PRODUCT
                  ? `data:image/png;base64,${Buffer.from(
                      product.IMAGE_PRODUCT.data
                    ).toString("base64")}`
                  : "default-image-url"
              }
              alt={product.NAME_PRODUCT}
            />
          </div>
          <div className="modal-details">
            <h2 className="modal-title">{product.NAME_PRODUCT}</h2>
            <p className="modal-description">{product.DESCRIPTION_PRODUCT}</p>
            <p className="modal-expiry">
              Expiring Date: {formatDate(product.EXPDATE_PRODUCT)}
            </p>
            <p className="modal-stock">
              Stock Quantity: {product.STOCK_PRODUCT}
            </p>
            <p className="modal-price">
              Price: {product.PRICE_PRODUCT} DH
            </p>
            <div className="quantity-container">
              <span className="quantity-label">Quantity</span>
              <input
                type="number"
                min="1"
                max={product.STOCK_PRODUCT}
                value={quantity}
                onChange={handleQuantityChange}
                className="quantity-input"
              />
            </div>
            <div className="total-price-container">
              <span className="total-price-label">Total Price:</span>
              <span className="total-price">{totalPrice} DH</span>
            </div>
            <button className="btn btn-custom-green" onClick={handleAddToCart}>
              <i className="fa fa-shopping-cart" aria-hidden="true"></i> Add to
              Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
