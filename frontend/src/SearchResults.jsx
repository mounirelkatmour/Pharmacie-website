import React, { useEffect, useState } from "react";
import Header from "./Components/Header/Header";
import NavBar from "./Components/NavBar/NavBar";
import Footer from "./Components/Footer/Footer";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import ProductModal from "./Components/ProductModal/ProductModal"; // Import ProductModal
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner.jsx";
import Cookies from "js-cookie"; 
import { useNavigate, useLocation } from "react-router-dom";

function SearchResults() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  const handleAddToCart = async (product) => {
    const user = Cookies.get("user") || sessionStorage.getItem("user");
    if (!user) {
      navigate("/login");
    } else {
      try {
        const userData = JSON.parse(user);
        const userId = userData.id;

        await axios.post("http://localhost:8081/add-to-cart", {
          id_product: product.ID_PRODUCT,
          id_user: userId,
        });

        alert("Product added to cart successfully!");
      } catch (err) {
        console.error("Error adding product to cart:", err);
        alert("Error adding product to cart.");
      }
    }
  };

  useEffect(() => {
    if (query) {
      axios
        .get("http://localhost:8081/products-search", { params: { search: query } })
        .then((res) => {
          if (res.status === 200) {
            setProducts(res.data);
          } else {
            setError("Error fetching products");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching products:", err.response ? err.response.data : err.message);
          setError("Error fetching products");
          setLoading(false);
        });
    }
  }, [query]);
  
  

  const bufferToBase64 = (buffer) => {
    const base64String = Buffer.from(buffer).toString("base64");
    return `data:image/png;base64,${base64String}`;
  };

  const handleMouseMove = (e, product) => {
    const img = e.target;
    const { left, top, width, height } = img.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Header />
      <NavBar />
      <div id="SearchResultsContent" className="container">
        <h1 className="text-center mt-2 mb-4">
          Search Results for "{query}"
        </h1>
        <div className="row">
          {products.length === 0 ? (
            <p className="text-center mt-2 mb-5">No products found</p>
          ) : (
            products.map((product) => (
              <div key={product.ID_PRODUCT} className="col-md-4 mb-3">
                <div className="card">
                  <div className="img-container">
                    <img
                      src={
                        product.IMAGE_PRODUCT
                          ? bufferToBase64(product.IMAGE_PRODUCT.data)
                          : "default-image-url"
                      }
                      className="card-img-top"
                      alt={product.NAME_PRODUCT}
                      onMouseMove={(e) => handleMouseMove(e, product)}
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title text-center">
                      {product.NAME_PRODUCT}
                    </h5>
                    <p className="card-text text-center">
                      {product.PRICE_PRODUCT} DH
                    </p>
                    <div id="ButtonContainer">
                      <button
                        className="btn btn-custom-green"
                        onClick={() => handleViewDetails(product)}
                      >
                        <i className="fa fa-eye" aria-hidden="true"></i> View
                        Details
                      </button>
                      <button
                        className="btn btn-custom-green"
                        onClick={() => handleAddToCart(product)}
                      >
                        <i className="fa fa-shopping-cart" aria-hidden="true"></i> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default SearchResults;
