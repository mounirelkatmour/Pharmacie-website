import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProductPage.css"; // Reuse the same CSS file
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate

const UpdateProductPage = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate(); // Initialize navigate
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expdate, setExpdate] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(""); // Initialize as an empty string
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false); // State for loading

  useEffect(() => {
    const fetchCategoriesAndProduct = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get("http://localhost:8081/categories");
        setCategories(categoriesResponse.data);

        // Fetch product details
        const productResponse = await axios.get(`http://localhost:8081/product/${id}`);
        const product = productResponse.data;

        setName(product.NAME_PRODUCT);
        setDescription(product.DESCRIPTION_PRODUCT);
        setExpdate(product.EXPDATE_PRODUCT.split("T")[0]); // Fix date format
        setPrice(product.PRICE_PRODUCT.toFixed(2)); // Ensure price is formatted as a float with 2 decimals
        setStock(product.STOCK_PRODUCT);
        setImage(product.IMAGE_PRODUCT); // Ensure this is a base64 string or URL

        // Parse categories from the product data
        const categoryIds = product.categories ? product.categories.split(',').map(Number) : [];
        setSelectedCategories(categoryIds);
      } catch (error) {
        console.error("Error fetching categories or product details!", error);
      }
    };

    fetchCategoriesAndProduct();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result.split(",")[1]); // Get base64 part after comma
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    setSelectedCategories((prev) =>
      e.target.checked
        ? [...prev, categoryId]
        : prev.filter((id) => id !== categoryId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state

    try {
      const response = await axios.put(`http://localhost:8081/update-product/${id}`, {
        name_product: name,
        description_product: description,
        expdate_product: expdate,
        price_product: parseFloat(price).toFixed(2), // Ensure price is a float with 2 decimal places
        stock_product: stock,
        image_product: image,
        categories: selectedCategories,
      });
      alert(response.data.message);
      navigate("/products"); // Redirect to products page after update
    } catch (error) {
      console.error("Error updating the product!", error);
      alert("Error updating the product. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div id="formAddProduct" className="add-product-page">
      <h1>Update Product</h1>
      {image && (
        <img
          src={`data:image/png;base64,${image}`} // Display the old image as base64
          alt="Old Product"
          style={{ width: "100px", height: "100px", objectFit: "cover" }}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Expiring Date:</label>
          <input
            type="date"
            value={expdate}
            onChange={(e) => setExpdate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Price:</label>
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0" // Prevent negative values
            step="0.01" // Allow decimal values
          />
        </div>
        <div>
          <label>Stock Quantity:</label>
          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            min="0" // Prevent negative values
          />
        </div>
        <div>
          <label>Upload New Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <div className="category-container">
          <label className="category-title">Categories:</label>
          {categories.map((category) => (
            <div key={category.id_category} className="category-checkbox">
              <input
                type="checkbox"
                value={category.id_category}
                checked={selectedCategories.includes(category.id_category)}
                onChange={handleCategoryChange}
                id={`category-${category.id_category}`}
              />
              <label htmlFor={`category-${category.id_category}`}>
                {category.name_category}
              </label>
            </div>
          ))}
        </div>
        <button id="updateProduct" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default UpdateProductPage;
