import { Card, CardBody } from "@nextui-org/react";
import React from "react";
import { GiMedicines } from "react-icons/gi";
import { categoryForm } from "../../constants";
import { categoryFieldTypes } from "../../types";
import { useCategoryStore } from "../../components/store";
import { useNavigate } from "react-router-dom";

const Medication: React.FC = () => {
  const navigate = useNavigate();

  const { setCategoryField } = useCategoryStore();

  const handleCategory = (category: categoryFieldTypes) => {
    const newCategory: categoryFieldTypes = {
      category: category.category,
      data: category.data,
    };

    setCategoryField(newCategory);
  };

  return (
    <div className="w-full flex flex-col gap-5 p-3">
      <h1 className="text-2xl font-bold flex items-center justify-start gap-3">
        <GiMedicines size={30} className="text-green-500" /> Select Category to
        Update Medication
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
        {categoryForm?.map((item, index) => (
          <Card key={index}>
            <CardBody className="relative flex flex-col items-center justify-center gap-4 p-3 cursor-pointer group">
              <div className="w-full flex items-center justify-between px-3 absolute top-3 left-0">
                <h1 className="text-green-500 font-medium text-sm">
                  {index + 1}
                </h1>
              </div>
              <p className="text-green-500 py-3 text-center text-xl tracking-wider font-medium mt-7">
                {item.category}
              </p>

              {/* Red overlay div with smooth transition */}
              <div
                onClick={() => {
                  handleCategory(item);
                  if (item.category === "PRENATAL & POSPARTUM CARE") {
                    navigate("/view-pregnant");
                  } else if (item.category === "PERSON WITH DISABILITY (PWD)") {
                    navigate("/view-PWD"); // Change to the correct path for this category
                  }else if (item.category === "10-19 YEARS OLD (ADOLESCENTS)") {
                    navigate("/view-10to19"); // Change to the correct path for this category
                  } 
                  else if (item.category === "WRA (15-49 YEARS OLD) FAMILY PLANNING") {
                    navigate("/view-WRA"); // Change to the correct path for this categor
                  }else if (item.category === "HYPERTENSIVE AND TYPE 2 DIABETES MELITUS") {
                    navigate("/view-hypertensive"); // Change to the correct path for this category
                  }else if (item.category === "0-59 MONTHS OLD CHILDREN - NUTRITION SERVICES") {
                    navigate("/view-0-59MO"); // Change to the correct path for this category
                  }else if (item.category === "SENIOR CITIZEN(60 YEARS OLD ABOVE)") {
                    navigate("/view-senior-citizen"); // Change to the correct path for this category
                  }else if (item.category === "FILARIASIS PROGRAM SERVICES") {
                    navigate("/view-filariasis"); // Change to the correct path for this category
                  }else if (item.category === "5-9 YEARS OLD CHILDREN (SCHOOL AGED CHILDREN)") {
                    navigate("/view-5-9yearsold"); // Change to the correct path for this category
                  }else if (item.category === "0-11 MONTHS OLD INFANTS - IMMUNIZATION SERVICES") {
                    navigate("/view-0-11monthsold"); // Change to the correct path for this category
                  }else if (item.category === "SCHISTOSOMIASIS PROGRAM SERVICES") {
                    navigate("/view-schistomiasis"); // Change to the correct path for this category
                  }else if (item.category === "CURRENT SMOKERS") {
                    navigate("/view-currentsmokers"); // Change to the correct path for this category
                  }else if (item.category === "0-59 YEARS OLD SCREENED FOR VISUAL ACTIVITY") {
                    navigate("/view-0-59yearsold"); // Change to the correct path for this category
                  }
                  else {
                    navigate("/view-category");
                  }
                }}

                className="absolute w-full h-full bg-[rgba(94,243,94,0.9)] opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 flex items-center justify-center"
              >

                <button className="text-xl text-white font-medium tracking-wider animate-pulse">
                  Click to View
                </button>
              </div>

            </CardBody>
          </Card>
        ))}
      </div>

      {/* {isOpenForm && (
        <ViewMedicationForm
          isOpen={isOpenForm}
          medicationType={medicationType}
          onClose={() => setIsOpenForm(false)}
        />
      )} */}
    </div>
  );
};

export default Medication;
