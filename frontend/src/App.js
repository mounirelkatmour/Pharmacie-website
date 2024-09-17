import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home'; // Import the Home component
import Login from './Login';
import SignUp from './SignUp';
import Account from './Account';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Products from './Products';
import AddProductPage from './AddProductPage';
import Cart from './Cart';
import Medicines from './Medicines';
import Baby from './Baby';
import Supplements from './Supplements';
import Bio from './Bio';
import ContactUs from './Contactus';
import BestSellers from './BestSellers';
import NewProducts from './NewProducts';
import Prescription from './Prescription';
import SearchResults from './SearchResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/prescriptions" element={<Prescription />} />
        <Route path="/supplements" element={<Supplements />} />
        <Route path="/bio" element={<Bio />} />
        <Route path="/baby" element={<Baby />} />
        <Route path="/best-sellers" element={<BestSellers />} />
        <Route path="/new-products" element={<NewProducts />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/personal-info" element={<PrivateRoute element={Account} />} />
        <Route path="/your-orders" element={<PrivateRoute element={Account} />} />
        <Route path="/login" element={<PublicRoute element={Login} />} />
        <Route path="/signup" element={<PublicRoute element={SignUp} />} />
        <Route path="/cart" element={<PrivateRoute element={Cart} />} />
        <Route path="/account" element={<PrivateRoute element={Account} />} />
        <Route path="/add-product" element={<AddProductPage />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </Router>
  );
}

export default App;
