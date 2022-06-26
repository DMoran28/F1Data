// React dependencies.
import React, { useState } from "react";
import { Link } from "react-router-dom";

// Header styles.
import "../styles/Header.css";

// Header component.
function Header(props) {
  // State to set open the navigation bar.
  const [isOpen, setIsOpen] = useState(false);

  // Function to open or close the navigation bar when clicked.
  function handleClick() {
    setIsOpen(!isOpen);
  }

  return (
    <header className="header">
      <Link
        to={"/"}
        className="logo"
        onClick={() => (isOpen ? handleClick() : null)}
      >
        <img className="logo-img" src={require("../img/F1.png")} alt="Formula 1's logo" />
        <span className="logo-title">Data</span>
      </Link>
      {props.items.length !== 0 && (
        <ul className={`nav-list ${isOpen ? "nav-active" : ""}`}>
          {props.items.map((item) => (
            <li className="nav-item" key={item}>
              <Link
                to={`/${item.toLowerCase()}`}
                className="nav-link"
                onClick={() => (isOpen ? handleClick() : null)}
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div
        className={`burger ${isOpen ? "nav-active" : ""}`}
        onClick={handleClick}
      >
        <div className="burger-first-line"></div>
        <div className="burger-second-line"></div>
        <div className="burger-third-line"></div>
      </div>
    </header>
  );
}

export default Header;
