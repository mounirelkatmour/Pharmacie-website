import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Header from "./Components/Header/Header";
import NavBar from "./Components/NavBar/NavBar";
import Footer from "./Components/Footer/Footer";
import "./Cart.css";
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner";
import Swal from "sweetalert2"; // Import SweetAlert2

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [modifiedQuantities, setModifiedQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      const user = Cookies.get("user") || sessionStorage.getItem("user");
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userData = JSON.parse(user);
        const userId = userData.id;
        const response = await axios.get(
          `http://localhost:8081/cart-items/${userId}`
        );
        setCartItems(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cart items:", err);
        setError("Error fetching cart items.");
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [navigate]);

  const handleQuantityChange = (idProduct, newQuantity) => {
    setModifiedQuantities((prev) => ({
      ...prev,
      [idProduct]: newQuantity,
    }));
  };

  const handleUpdateQuantities = async () => {
    try {
      const user = Cookies.get("user") || sessionStorage.getItem("user");
      if (!user) {
        navigate("/login");
        return;
      }

      const userData = JSON.parse(user);
      const userId = userData.id;

      await axios.put("http://localhost:8081/update-cart-items", {
        userId,
        quantities: modifiedQuantities,
      });

      // Refresh cart items
      const response = await axios.get(
        `http://localhost:8081/cart-items/${userId}`
      );
      setCartItems(response.data);
      setModifiedQuantities({});
      Swal.fire({
        title: "Success!",
        text: "Cart items updated successfully!",
        icon: "success",
        confirmButtonColor: "#009900",
      });
    } catch (err) {
      console.error("Error updating cart items:", err);
      Swal.fire({
        title: "Error!",
        text: "Error updating cart items.",
        icon: "error",
        confirmButtonColor: "#009900",
      });
    }
  };

  const handleDeleteProduct = async (idProduct) => {
    try {
      const user = Cookies.get("user") || sessionStorage.getItem("user");
      if (!user) {
        navigate("/login");
        return;
      }

      const userData = JSON.parse(user);
      const userId = userData.id;

      await axios.delete("http://localhost:8081/delete-cart-item", {
        data: { id_product: idProduct, id_user: userId },
      });

      setCartItems(cartItems.filter((item) => item.id_product !== idProduct));
      Swal.fire({
        title: "Deleted!",
        text: "Product has been removed from your cart.",
        icon: "success",
        confirmButtonColor: "#009900",
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Error deleting cart item:", err);
      Swal.fire({
        title: "Error!",
        text: "Error deleting cart item.",
        icon: "error",
        confirmButtonColor: "#009900",
      });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.price_product,
    0
  );

  const handleOrder = async () => {
    try {
      const user = Cookies.get("user") || sessionStorage.getItem("user");
      if (!user) {
        navigate("/login");
        return;
      }

      const userData = JSON.parse(user);
      const userId = userData.id;

      // Create order data with products
      const orderData = {
        id_user: userId,
        price_order: totalPrice,
        date_order: new Date().toISOString().slice(0, 19).replace("T", " "),
        products: cartItems.map((item) => ({
          id_product: item.id_product,
          quantity: modifiedQuantities[item.id_product] || item.quantity,
        })),
      };

      // Create a new order
      const orderResponse = await axios.post("http://localhost:8081/orders", orderData);
      const orderId = orderResponse.data.orderId;

      // Create order details
      const orderDetails = cartItems.map((item) => ({
        id_product: item.id_product,
        quantity_product: modifiedQuantities[item.id_product] || item.quantity,
        price_product: (modifiedQuantities[item.id_product] || item.quantity) * item.price_product,
      }));

      await axios.post("http://localhost:8081/order-details", {
        id_order: orderId,
        orderDetails: orderDetails,
      });

      // Clear the cart
      await axios.delete(`http://localhost:8081/clear-cart/${userId}`);
      setCartItems([]);
      Swal.fire({
        title: "Order Placed!",
        text: "Your order has been placed successfully.",
        icon: "success",
        confirmButtonColor: "#009900",
      });
      navigate("/");
    } catch (err) {
      console.error("Error placing order:", err.response ? err.response.data : err.message);
      Swal.fire({
        title: "Error!",
        text: "Error placing order.",
        icon: "error",
        confirmButtonColor: "#009900",
      });
    }
  };

  return (
    <div className="cart-page">
      <Header />
      <NavBar />
      <div className="cart-container">
        <h1>Your Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id_product}>
                    <td>{item.name_product}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max={item.stock_product}
                        value={
                          modifiedQuantities[item.id_product] || item.quantity
                        }
                        onChange={(e) =>
                          handleQuantityChange(
                            item.id_product,
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="quantity-input"
                      />
                    </td>
                    <td>{item.price_product} DH</td>
                    <td>
                      {(modifiedQuantities[item.id_product] || item.quantity) *
                        item.price_product}{" "}
                      DH
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-delete"
                        onClick={() => handleDeleteProduct(item.id_product)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cart-total">
              <h2>Total Price: {totalPrice} DH</h2>
              <div className="cart-buttons-container">
                <button
                  className="order-button"
                  onClick={handleUpdateQuantities}
                >
                  Update quantities
                </button>
                <button className="order-button" onClick={handleOrder}>
                  Order
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Cart;
