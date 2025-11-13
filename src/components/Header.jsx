import React from "react";
import { Link } from "react-router-dom";
import "../static/Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">🌸 FlowerLand</h1>

        <nav className="nav">
          <Link to="/" className="nav-link">Каталог</Link>
          <Link to="/profile" className="nav-link">Личный кабинет</Link>
          <Link to="/cart" className="nav-link">Корзина 🛒</Link>
        </nav>
      </div>
    </header>
  );
}
