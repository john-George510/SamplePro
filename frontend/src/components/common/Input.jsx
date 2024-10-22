// src/components/common/Input.jsx
import React from 'react';

const Input = ({ label, name, value, onChange, type = 'text', ...props }) => {
  return (
    <div className="input-group">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};

export default Input;
