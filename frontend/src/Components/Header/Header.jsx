import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie'; 
import img from "./logo-nobg.png";
import "./Header.css";

function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const handleAccountClick = () => {
    const user = Cookies.get('user') || sessionStorage.getItem('user');
    navigate(user ? '/account' : '/login');
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${searchTerm}`);
    }
  };

  return (
    <div id="Header">
      <Link to='/' id="Logo">
        <img src={img} alt="Logo" />
      </Link>
      <div id="SearchBar">
        <input 
          id="SearchBarInput" 
          placeholder="Search ..." 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button id="buttonSearch" onClick={handleSearch}>
          <i className="fa fa-search"></i>
        </button>
      </div>
      <div id="ButtonsContainer">
        <Link to='/contact-us' id="ContactUs">
          <i className="fa fa-phone"></i>
          <span className="ButtonText">Contact us</span>
        </Link>
        <Link to='/cart' id="Cart">
          <i className="fa fa-shopping-cart"></i>
          <span className="ButtonText">Cart</span>
        </Link>
        <button id="Account" onClick={handleAccountClick}>
          <i className="fa fa-user"></i>
          <span className="ButtonText">Account</span>
        </button>
      </div>
    </div>
  );
}

export default Header;
