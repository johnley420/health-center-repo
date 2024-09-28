// import React, { ChangeEventHandler, useState } from "react";
// type formDataType = {
//   name: string;
//   age: number;
// };
// const Test = () => {
//   const [formData, setFormData] = useState<formDataType>({ name: "", age: 0 });

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = event.target;
//     setFormData((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     console.log(formData);
//   };
//   return (
//     <div className="w-screen h-screen flex items-center justify-center">
//       <div className="w-[300px] bg-red-500">
//         <input
//           type="text"
//           onChange={}
//           name="name"
//           className="w-full p-2 border"
//           placeholder="name"
//         />
//         <input
//           type="text"
//           onChange={handleChange}
//           name="name"
//           className="w-full p-2 border"
//           placeholder="age"
//         />
//         <button onClick={handleSubmit} className="w-full py-2 bg-blue-500 ">
//           Submit
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Test;

import React from "react";

const Test = () => {
  return <div></div>;
};

export default Test;
