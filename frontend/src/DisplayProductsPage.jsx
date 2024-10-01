import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DisplayProductsPage.css"; // Import the updated CSS
import "bootstrap-icons/font/bootstrap-icons.css";
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner.jsx";

function DisplayProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8081/products")
      .then((res) => {
        if (res.status === 200) {
          setProducts(res.data);
          setLoading(false);
        } else {
          setError("Error fetching products");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Error fetching products");
        setLoading(false);
      });
  }, []);

  const handleEditProduct = (productId) => {
    // Redirect to the UpdateProductPage with the product ID
    window.location.href = `/update-product/${productId}`;
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:8081/products/${productId}`);
      setProducts(products.filter((product) => product.ID_PRODUCT !== productId));
      alert("Product removed successfully!");
    } catch (error) {
      console.error("Error removing product:", error);
      alert("Error removing product.");
    }
  };

  const bufferToBase64 = (buffer) => {
    if (buffer) {
      const base64String = Buffer.from(buffer.data).toString("base64");
      return `data:image/png;base64,${base64String}`;
    }
    return "default-image-url"; // Fallback image URL
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  return (
    <div id="display-products-page">
      <div className="container">
        <h1 id="display-products-title">Products management section</h1>
        <div className="row">
          {products.length === 0 ? (
            <p>No products available</p>
          ) : (
            products.map((product) => (
              <div key={product.ID_PRODUCT} className="col-md-4 mb-3">
                <div className="card product-card">
                  <img
                    src={bufferToBase64(product.IMAGE_PRODUCT)}
                    className="card-img-top product-card-image"
                    alt={product.NAME_PRODUCT}
                  />
                  <div className="card-body">
                    <h5 className="card-title product-card-title">
                      {product.NAME_PRODUCT}
                    </h5>
                    <p className="card-text product-card-price">
                      {product.PRICE_PRODUCT} DH
                    </p>
                    <div id="button-container">
                      <button
                        className="btn product-action-button product-edit-button"
                        onClick={() => handleEditProduct(product.ID_PRODUCT)}
                      >
                        <i className="fa fa-pencil" aria-hidden="true"></i> Edit
                      </button>
                      <button
                        className="btn product-action-button product-remove-button"
                        onClick={() => handleRemoveProduct(product.ID_PRODUCT)}
                      >
                        <i className="fa fa-trash" aria-hidden="true"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DisplayProductsPage;
