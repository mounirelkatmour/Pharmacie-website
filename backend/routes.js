const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const multer = require("multer");
const fs = require("fs");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pharmacy_alatlas",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to the database.");
});

// Home route
router.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Signup route
router.post("/signup", (req, res) => {
  const sql =
    "INSERT INTO user (username_user, phone_user, city_user, email_user, password_user) VALUES (?)";
  const values = [
    req.body.username,
    req.body.phone,
    req.body.city,
    req.body.email,
    req.body.password,
  ];
  db.query(sql, [values], (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Error creating user" });
    }
    return res.status(201).json(data);
  });
});

// Login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check if the email exists in the user table
  const userSql = "SELECT id_user, username_user, phone_user, city_user, email_user, isAdmin FROM user WHERE email_user = ? AND password_user = ?";
  db.query(userSql, [email, password], (err, userData) => {
    if (err) {
      console.error("Error executing user query:", err);
      return res.status(500).json({ error: "Error logging in" });
    }

    if (userData.length > 0) {
      const { id_user, username_user, phone_user, city_user, email_user, isAdmin } = userData[0];
      
      // Ensure isAdmin is interpreted as a string
      const adminStatus = isAdmin === "True" ? "True" : "False";

      return res.status(200).json({
        message: "User login successful",
        user: {
          id: id_user,
          username: username_user,
          phone: phone_user,
          city: city_user,
          email: email_user,
          isAdmin: adminStatus,  // Include isAdmin in the response as a string
        },
      });
    } else {
      return res.status(401).json({ message: "Email or password are incorrect" });
    }
  });
});

// Get products route
router.get("/products", (req, res) => {
  const sql = "SELECT * FROM product";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Error fetching products" });
    }
    return res.status(200).json(data);
  });
});

// Get categories route
router.get("/categories", (req, res) => {
  const sql = "SELECT id_category, name_category FROM category";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ error: "Error fetching categories" });
    }
    return res.status(200).json(data);
  });
});

// Add new product route
router.post("/add-product", (req, res) => {
  const {
    name_product,
    description_product,
    expdate_product,
    price_product,
    stock_product,
    image_product,
    categories,
  } = req.body;

  const imageProductBuffer = image_product
    ? Buffer.from(image_product, "base64")
    : null;

  const sqlProduct =
    "INSERT INTO product (name_product, description_product, expdate_product, price_product, image_product, stock_product) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [
    name_product,
    description_product,
    expdate_product,
    price_product,
    imageProductBuffer,
    stock_product,
  ];

  db.query(sqlProduct, values, (err, result) => {
    if (err) {
      console.error("Error inserting product:", err);
      return res.status(500).json({ error: "Error inserting product" });
    }

    const productId = result.insertId;

    if (categories && categories.length > 0) {
      const sqlBelong = "INSERT INTO belong (id_product, id_category) VALUES ?";
      const belongValues = categories.map((categoryId) => [
        productId,
        categoryId,
      ]);

      db.query(sqlBelong, [belongValues], (err, result) => {
        if (err) {
          console.error("Error inserting into belong:", err);
          return res.status(500).json({ error: "Error inserting categories" });
        }

        return res
          .status(201)
          .json({ message: "Product and categories added successfully" });
      });
    } else {
      return res.status(201).json({ message: "Product added successfully" });
    }
  });
});

// Add product to cart route
router.post("/add-to-cart", (req, res) => {
  const { id_product, id_user, quantity_product } = req.body;

  if (!id_product || !id_user) {
    return res
      .status(400)
      .json({ error: "Product ID and User ID are required" });
  }

  const quantity = quantity_product ? quantity_product : 1;

  // Check if the user already has a cart
  const checkCartSql = "SELECT id_cart FROM cart WHERE id_user = ?";
  db.query(checkCartSql, [id_user], (err, cartData) => {
    if (err) {
      console.error("Error checking user cart:", err);
      return res.status(500).json({ error: "Error checking user cart" });
    }

    let cartId;
    if (cartData.length > 0) {
      cartId = cartData[0].id_cart;
    } else {
      // Create a new cart for the user
      const createCartSql = "INSERT INTO cart (id_user) VALUES (?)";
      db.query(createCartSql, [id_user], (err, result) => {
        if (err) {
          console.error("Error creating new cart:", err);
          return res.status(500).json({ error: "Error creating new cart" });
        }
        cartId = result.insertId;

        // After creating a new cart, add the product
        addOrUpdateProductInCart(id_product, cartId, quantity);
      });
      return;
    }

    // Add or update the product in the cart
    addOrUpdateProductInCart(id_product, cartId, quantity);
  });

  function addOrUpdateProductInCart(id_product, id_cart, quantity) {
    const checkProductSql =
      "SELECT quantity_product FROM be WHERE id_product = ? AND id_cart = ?";
    db.query(checkProductSql, [id_product, id_cart], (err, result) => {
      if (err) {
        console.error("Error checking product in cart:", err);
        return res
          .status(500)
          .json({ error: "Error checking product in cart" });
      }

      if (result.length > 0) {
        // If product is already in the cart, update the quantity
        const newQuantity = result[0].quantity_product + quantity;
        const updateProductSql =
          "UPDATE be SET quantity_product = ? WHERE id_product = ? AND id_cart = ?";
        db.query(
          updateProductSql,
          [newQuantity, id_product, id_cart],
          (err) => {
            if (err) {
              console.error("Error updating product quantity:", err);
              return res
                .status(500)
                .json({ error: "Error updating product quantity" });
            }
            return res
              .status(200)
              .json({ message: "Product quantity updated in cart" });
          }
        );
      } else {
        // If product is not in the cart, insert it
        const addProductSql =
          "INSERT INTO be (id_product, id_cart, quantity_product) VALUES (?, ?, ?)";
        db.query(addProductSql, [id_product, id_cart, quantity], (err) => {
          if (err) {
            console.error("Error adding product to cart:", err);
            return res
              .status(500)
              .json({ error: "Error adding product to cart" });
          }
          return res.status(201).json({ message: "Product added to cart" });
        });
      }
    });
  }
});

// Update quantity in the cart
router.put("/update-cart-item", (req, res) => {
  const { id_product, id_user, quantity_product } = req.body;

  if (!id_product || !id_user || quantity_product === undefined) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const updateQuantitySql =
    "UPDATE be SET quantity_product = ? WHERE id_product = ? AND id_cart = (SELECT id_cart FROM cart WHERE id_user = ?)";
  db.query(
    updateQuantitySql,
    [quantity_product, id_product, id_user],
    (err, result) => {
      if (err) {
        console.error("Error updating cart item quantity:", err);
        return res
          .status(500)
          .json({ error: "Error updating cart item quantity" });
      }
      return res
        .status(200)
        .json({ message: "Cart item quantity updated successfully" });
    }
  );
});

// Delete product from the cart
router.delete("/delete-cart-item", (req, res) => {
  const { id_product, id_user } = req.body;

  if (!id_product || !id_user) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const deleteProductSql =
    "DELETE FROM be WHERE id_product = ? AND id_cart = (SELECT id_cart FROM cart WHERE id_user = ?)";
  db.query(deleteProductSql, [id_product, id_user], (err, result) => {
    if (err) {
      console.error("Error deleting cart item:", err);
      return res.status(500).json({ error: "Error deleting cart item" });
    }
    return res.status(200).json({ message: "Cart item deleted successfully" });
  });
});

// Update multiple cart items
router.put("/update-cart-items", (req, res) => {
  const { userId, quantities } = req.body;

  if (!userId || !quantities) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const updateQueries = Object.entries(quantities).map(
    ([id_product, quantity]) => {
      return db.query(
        "UPDATE be SET quantity_product = ? WHERE id_product = ? AND id_cart = (SELECT id_cart FROM cart WHERE id_user = ?)",
        [quantity, id_product, userId]
      );
    }
  );

  Promise.all(updateQueries)
    .then(() =>
      res.status(200).json({ message: "Cart items updated successfully" })
    )
    .catch((err) => {
      console.error("Error updating cart items:", err);
      res.status(500).json({ error: "Error updating cart items" });
    });
});

// Get cart items route
router.get("/cart-items/:userId", (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT p.id_product, p.name_product, p.price_product, b.quantity_product AS quantity
    FROM product p
    JOIN be b ON p.id_product = b.id_product
    JOIN cart c ON b.id_cart = c.id_cart
    WHERE c.id_user = ?
  `;

  db.query(sql, [userId], (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Error fetching cart items" });
    }
    res.status(200).json(data);
  });
});

// Get products in "Medecines" category
router.get("/medicines", (req, res) => {
  const sql = `
    SELECT p.*
    FROM product p
    JOIN belong b ON p.id_product = b.id_product
    JOIN category c ON b.id_category = c.id_category
    WHERE c.name_category = 'Medecines'
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Error fetching products" });
    }
    return res.status(200).json(data);
  });
});

// Get products in "Baby" category
router.get("/baby", (req, res) => {
  const sql = `
    SELECT p.*
    FROM product p
    JOIN belong b ON p.id_product = b.id_product
    JOIN category c ON b.id_category = c.id_category
    WHERE c.name_category = 'Baby'
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Error fetching products" });
    }
    return res.status(200).json(data);
  });
});

// Get products in "Supplements" category
router.get("/supplements", (req, res) => {
  const sql = `
    SELECT p.*
    FROM product p
    JOIN belong b ON p.id_product = b.id_product
    JOIN category c ON b.id_category = c.id_category
    WHERE c.name_category = 'Supplements'
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Error fetching products" });
    }
    return res.status(200).json(data);
  });
});

// Get products in "Bio" category
router.get("/bio", (req, res) => {
  const sql = `
    SELECT p.*
    FROM product p
    JOIN belong b ON p.id_product = b.id_product
    JOIN category c ON b.id_category = c.id_category
    WHERE c.name_category = 'Bio'
  `;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Error fetching products" });
    }
    return res.status(200).json(data);
  });
});

// Create a new order
router.post("/orders", (req, res) => {
  const { id_user, price_order, date_order, products } = req.body; // Added products field

  if (!id_user || price_order === undefined || !date_order || !products) {
    // Added products check
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // Begin a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).json({ error: "Error starting transaction" });
    }

    // Insert order
    const sqlInsertOrder =
      "INSERT INTO ordering (id_user, price_order, date_order) VALUES (?, ?, ?)";
    db.query(
      sqlInsertOrder,
      [id_user, price_order, date_order],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error creating order:", err);
            res.status(500).json({ error: "Error creating order" });
          });
        }

        const orderId = result.insertId;

        // Update product stock and quantity sold
        const productUpdates = products.map((product) => {
          const { id_product, quantity } = product;
          return new Promise((resolve, reject) => {
            const sqlUpdateProduct = `
            UPDATE product
            SET stock_product = stock_product - ?, quantitysold_product = quantitysold_product + ?
            WHERE id_product = ?
          `;
            db.query(
              sqlUpdateProduct,
              [quantity, quantity, id_product],
              (err, result) => {
                if (err) {
                  return reject(err);
                }
                resolve(result);
              }
            );
          });
        });

        // Execute all product updates
        Promise.all(productUpdates)
          .then(() => {
            // Commit transaction
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Error committing transaction:", err);
                  res
                    .status(500)
                    .json({ error: "Error committing transaction" });
                });
              }
              res
                .status(201)
                .json({ message: "Order created successfully", orderId });
            });
          })
          .catch((err) => {
            // Rollback transaction on error
            db.rollback(() => {
              console.error("Error updating product stock:", err);
              res.status(500).json({ error: "Error updating product stock" });
            });
          });
      }
    );
  });
});

// Add order details for each product
router.post("/order-details", (req, res) => {
  const { id_order, orderDetails } = req.body;

  if (!id_order || !orderDetails || !orderDetails.length) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const sql =
    "INSERT INTO orderdetail (id_order, id_product, quantity_product, price) VALUES ?";
  const values = orderDetails.map((detail) => [
    id_order,
    detail.id_product,
    detail.quantity_product,
    detail.price_product,
  ]);

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Error adding order details:", err);
      return res.status(500).json({ error: "Error adding order details" });
    }
    return res
      .status(201)
      .json({ message: "Order details added successfully" });
  });
});

// Clear the cart for a user
router.delete("/clear-cart/:userId", (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const sql =
    "DELETE FROM be WHERE id_cart = (SELECT id_cart FROM cart WHERE id_user = ?)";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error clearing cart:", err);
      return res.status(500).json({ error: "Error clearing cart" });
    }
    return res.status(200).json({ message: "Cart cleared successfully" });
  });
});

// Get orders
router.get("/orders/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT id_order, price_order AS total_amount, date_order
    FROM ordering 
    WHERE id_user = ?
    ORDER BY date_order DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ error: "Error fetching orders" });
    }
    return res.status(200).json(results);
  });
});

// Get best-sellers products route
router.get("/best-sellers", (req, res) => {
  const sql =
    "SELECT * FROM product ORDER BY quantitysold_product DESC LIMIT 6";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Error fetching products" });
    }
    return res.status(200).json(data);
  });
});

// Get newest products route
router.get("/new-products", (req, res) => {
  const sql = `
  SELECT * FROM product
  ORDER BY id_product DESC
  LIMIT 9
`;
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Error fetching products" });
    }
    return res.status(200).json(data);
  });
});

//post feedback
router.post("/submit-feedback", (req, res) => {
  const { id_user, text_feedback } = req.body;

  if (!id_user || !text_feedback) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const sqlInsertFeedback = "INSERT INTO feedback (id_user, text_feedback) VALUES (?, ?)";
  db.query(sqlInsertFeedback, [id_user, text_feedback], (err, result) => {
    if (err) {
      console.error("Error inserting feedback:", err);
      return res.status(500).json({ error: "Error inserting feedback" });
    }
    return res.status(201).json({ message: "Feedback submitted successfully" });
  });
});

// POST PRESCRIPTION
router.post("/add-prescription", (req, res) => {
  const { id_user, image_prescription, description_prescription } = req.body;

  const imagePrescriptionBuffer = image_prescription
    ? Buffer.from(image_prescription, "base64")
    : null;

  const sqlPrescription =
    "INSERT INTO prescription (ID_USER, IMAGE_PRESCRIPTION, DESCRIPTION_PRESCRIPTION) VALUES (?, ?, ?)";
  const values = [id_user, imagePrescriptionBuffer, description_prescription];

  db.query(sqlPrescription, values, (err, result) => {
    if (err) {
      console.error("Error inserting prescription:", err);
      return res.status(500).json({ error: "Error inserting prescription" });
    }
    return res.status(201).json({ message: "Prescription added successfully" });
  });
});

// Get products from search
router.get("/products-search", (req, res) => {
  const searchTerm = req.query.search;

  // Sanitize input to prevent SQL injection
  if (!searchTerm) {
    return res.status(400).json({ error: "Search term is required" });
  }

  // Ensure proper SQL query and error handling
  const sql = "SELECT * FROM product WHERE name_product LIKE ?";

  db.query(sql, [`%${searchTerm}%`], (err, data) => {
    if (err) {
      console.error("Error executing query:", err); // Detailed error log
      return res.status(500).json({ error: "Error fetching products" });
    }
    return res.status(200).json(data);
  });
});

// Delete product route
router.delete("/products/:id", (req, res) => {
  const id_product = req.params.id;

  const sql = "DELETE FROM product WHERE id_product = ?";
  db.query(sql, [id_product], (err, result) => {
    if (err) {
      console.error("Error deleting product:", err);
      return res.status(500).json({ error: "Error deleting product" });
    }
    return res.status(200).json({ message: "Product deleted successfully" });
  });
});

// Get product details by ID route
router.get("/product/:id", (req, res) => {
  const productId = req.params.id;
  const sql = `
    SELECT p.*, GROUP_CONCAT(c.id_category) AS categories
    FROM product p
    LEFT JOIN belong b ON p.id_product = b.id_product
    LEFT JOIN category c ON b.id_category = c.id_category
    WHERE p.id_product = ?
    GROUP BY p.id_product
  `;

  db.query(sql, [productId], (err, data) => {
    if (err) {
      console.error("Error fetching product details:", err);
      return res.status(500).json({ error: "Error fetching product details" });
    }
    if (data.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json(data[0]); // Return the first item (the product)
  });
});

// Update product route
router.put("/update-product/:id", (req, res) => {
  const productId = req.params.id;
  const {
    name_product,
    description_product,
    expdate_product,
    price_product,
    stock_product,
    image_product,
    categories, // Get categories from the request body
  } = req.body;

  // SQL query to update the product details
  const updateProductSql = `
    UPDATE product
    SET 
      name_product = ?, 
      description_product = ?, 
      expdate_product = ?, 
      price_product = ?, 
      image_product = ?, 
      stock_product = ?
    WHERE id_product = ?`;

  // Values to update
  const values = [
    name_product,
    description_product,
    expdate_product,
    price_product,
    Buffer.from(image_product, "base64"), // Assuming you're still using base64 for images
    stock_product,
    productId,
  ];

  // Start a transaction to ensure data integrity
  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).json({ error: "Error starting transaction" });
    }

    // Update the product details
    db.query(updateProductSql, values, (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error("Error updating product:", err);
          return res.status(500).json({ error: "Error updating product" });
        });
      }
      if (result.affectedRows === 0) {
        return db.rollback(() => {
          return res.status(404).json({ error: "Product not found" });
        });
      }

      // Clear existing categories for the product
      const deleteCategoriesSql = `DELETE FROM belong WHERE id_product = ?`;
      db.query(deleteCategoriesSql, [productId], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error deleting categories:", err);
            return res.status(500).json({ error: "Error deleting categories" });
          });
        }

        // Insert new categories
        const insertCategoriesSql = `INSERT INTO belong (id_product, id_category) VALUES ?`;
        const categoryValues = categories.map(categoryId => [productId, categoryId]);

        db.query(insertCategoriesSql, [categoryValues], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error inserting new categories:", err);
              return res.status(500).json({ error: "Error inserting new categories" });
            });
          }

          // Commit the transaction if all queries are successful
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error committing transaction:", err);
                return res.status(500).json({ error: "Error committing transaction" });
              });
            }

            return res.status(200).json({ message: "Product updated successfully" });
          });
        });
      });
    });
  });
});

// get feedbacks
router.get("/feedbacks", (req, res) => {
  const sql = `
    SELECT 
      u.username_user, u.city_user, u.phone_user, f.text_feedback 
    FROM 
      feedback f 
    JOIN 
      user u 
    ON 
      f.id_user = u.id_user;
  `;

  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching feedbacks:", err);
      return res.status(500).json({ error: "Error fetching feedbacks" });
    }
    res.status(200).json(data); // Send the feedback data to the frontend
  });
});

// Get prescriptions route
router.get("/prescriptions", (req, res) => {
  const sql = `
    SELECT p.id_prescription, 
           p.image_prescription, 
           p.description_prescription, 
           u.username_user, 
           u.city_user, 
           u.phone_user
    FROM prescription p
    JOIN user u ON p.id_user = u.id_user`;

  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching prescriptions:", err);
      return res.status(500).json({ error: "Error fetching prescriptions" });
    }

    // Convert images to base64 for frontend usage
    const prescriptionsWithImages = data.map(prescription => ({
      ...prescription,
      image_prescription: prescription.image_prescription ? prescription.image_prescription.toString('base64') : null
    }));

    return res.status(200).json(prescriptionsWithImages);
  });
});

// GET ALL ORDERS
router.get("/see-orders", (req, res) => {
  const sqlOrders = `
    SELECT o.ID_ORDER, o.ID_USER, o.PRICE_ORDER, o.DATE_ORDER, u.username_user
    FROM ordering o
    JOIN user u ON o.ID_USER = u.id_user
  `;

  db.query(sqlOrders, (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ error: "Error fetching orders" });
    }
    res.status(200).json(results);
  });
});

// GET ORDER DETAILS BY ID
router.get("/order-details/:id", (req, res) => {
  const orderId = req.params.id;

  const sqlOrderDetails = `SELECT * FROM orderdetail
    JOIN product 
    ON orderdetail.ID_PRODUCT = product.ID_PRODUCT 
    WHERE orderdetail.ID_ORDER = ?`;
  db.query(sqlOrderDetails, [orderId], (err, orderDetails) => {
    if (err) {
      console.error("Error fetching order details:", err);
      return res.status(500).json({ error: "Error fetching order details" });
    }
    res.status(200).json(orderDetails);
  });
});



module.exports = router;