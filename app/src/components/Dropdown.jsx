// React dependencies.
import React, { useState, useEffect } from "react";

// Dropdown styles.
import "../styles/Dropdown.css";

// Images and icons.
import ExpandMore from "../img/expand-more.svg";
import ExpandLess from "../img/expand-less.svg";
import SoftTyre from "../img/soft-compound.png";

function Dropdown(props) {
  // State to save the selected item and check if the dropdown is open or not.
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState({ id: 0, value: "..." });

  // Callback function to handle a click in the dropdown.
  function handleItemClick(item) {
    if (!props.loading && !props.check) {
      setSelectedItem(item);
      props.callback(item.value);
    }
  }

  // Function to check if a item is selected.
  function isItemSelected(item) {
    return selectedItem.id === item.id;
  }

  // Hook to restart the selection of the dropdown when the given variable change its value.
  useEffect(() => {
    setSelectedItem({ id: 0, value: "..." });
  }, [props.restart]);

  return (
    <div
      tabIndex={0}
      className={`dropdown ${isOpen ? "dropdown-active" : ""}`}
      onClick={() => setIsOpen(!isOpen)}
      onBlur={() => setIsOpen(false)}
    >
      <label>{props.title}:</label>
      <div className="dropdown-header">
        <span>{props.check ? "..." : selectedItem.value}</span>
        <div className="dropdown-icons">
          <img
            className={`dropdown-loading ${
              props.loading ? "loading-active" : ""
            }`}
            src={SoftTyre}
            alt="Loading's icon"
          />
          <img
            className="dropdown-expand"
            src={`${isOpen ? ExpandLess : ExpandMore}`}
            alt={`Expand ${isOpen ? "Less" : "More"}'s Icon`}
          />
        </div>
      </div>
      <ul className="dropdown-list">
        {props.items.map((item) => (
          <li
            className={`dropdown-item ${
              isItemSelected(item) ? "selected-item" : ""
            }`}
            key={item.id}
          >
            <button
              type="button"
              className={`${isItemSelected(item) ? "selected-item" : ""}`}
              onClick={() => handleItemClick(item)}
            >
              {item.value}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dropdown;
