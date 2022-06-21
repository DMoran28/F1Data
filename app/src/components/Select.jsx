// React dependencies.
import React, { useState } from "react";

// Dropdown styles.
import "../styles/Select.css";

// Select component.
function Select(props) {
  // State to save the selected item.
  const [selectedItem, setSelectedItem] = useState(props.items[0]);

  // Callback function to handle a click in the select.
  function handleItemClick(item) {
    setSelectedItem(item);
    props.callback(item);
  }

  // Function to check if a item is selected.
  function isItemSelected(item) {
    return selectedItem === item;
  }

  return <div className="select">
    <span className="select-title">{props.title}:</span>
    <div className="select-options">
      {props.items.map((item) => (
        <div 
          className="select-option" 
          key={item}
          onClick={() => handleItemClick(item)}
        >
          <span className="select-option-title">{item}</span>
          <div className={`select-option-box ${isItemSelected(item) ? "select-option-selected" : ""}`}>
            <div></div>
          </div>
        </div>
      ))}
    </div>
  </div>
}

export default Select;