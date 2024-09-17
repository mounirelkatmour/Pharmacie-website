import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProductPage.css";
// import { useNavigate } from "react-router-dom";

const AddProductPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expdate, setExpdate] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  // const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8081/categories")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the categories!", error);
      });
  }, []);

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

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    setSelectedCategories((prev) =>
      e.target.checked
        ? [...prev, categoryId]
        : prev.filter((id) => id !== categoryId)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:8081/add-product", {
        name_product: name,
        description_product: description,
        expdate_product: expdate,
        price_product: price,
        stock_product: stock,
        image_product: image,
        categories: selectedCategories,
      })
      .then((response) => {
        alert(response.data.message);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      })
      .catch((error) => {
        console.error("There was an error adding the product!", error);
      });
  };

  return (
    <div id="formAddProduct" className="add-product-page">
      <h1>Add New Product</h1>
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
          />
        </div>
        <div>
          <label>Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <div className="category-container">
          <label className="category-title">Categories:</label>
          {categories.map((category) => (
            <div key={category.id_category} className="category-checkbox">
              <input
                type="checkbox"
                value={category.id_category}
                onChange={handleCategoryChange}
                id={`category-${category.id_category}`}
              />
              <label htmlFor={`category-${category.id_category}`}>
                {category.name_category}
              </label>
            </div>
          ))}
        </div>
        <button id="addProduct" type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProductPage;
