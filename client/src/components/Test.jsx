import React, { useState } from "react";

const Test = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData);
  };
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-[300px] bg-red-500">
        <input
          type="text"
          onChange={handleChange}
          name="name"
          className="w-full p-2 border"
          placeholder="name"
        />
        <input
          type="text"
          onChange={handleChange}
          name="name"
          className="w-full p-2 border"
          placeholder="age"
        />
        <button onClick={handleSubmit} className="w-full py-2 bg-blue-500 ">
          Submit
        </button>
      </div>
    </div>
  );
};

export default Test;
