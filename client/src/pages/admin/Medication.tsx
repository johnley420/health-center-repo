import { Card, CardBody } from "@nextui-org/react";
import React, { useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GiMedicines } from "react-icons/gi";
import { LuPencil } from "react-icons/lu";
import ViewMedicationForm from "../../components/modals/ViewMedicationForm";

const Medication = () => {
  const [isOpenForm, setIsOpenForm] = useState<boolean>(false);
  const [medicationType, setMedicationType] = useState<string>("");

  const handleViewForm = (e: React.FormEvent, type: string) => {
    e.preventDefault();
    setMedicationType(type);
    setIsOpenForm(true);
  };
  return (
    <div className="w-full flex flex-col gap-5 p-3">
      <h1 className="text-2xl font-bold flex items-center justify-start gap-3">
        <GiMedicines size={30} className="text-green-500" /> Select Category to
        Update Medication
      </h1>
      <div className="grid grid-cols-4 gap-4 mt-3">
        {Array.from({ length: 13 }, (_, i) => {
          return (
            <Card key={i}>
              <CardBody className="relative flex flex-col items-center justify-center gap-4 p-3 cursor-pointer group">
                <div className="w-full flex items-center justify-between px-3 absolute top-3 left-0">
                  <h1 className="text-green-500 font-medium text-sm">
                    {i + 1}
                  </h1>
                  <div className="flex items-center justify-center gap-3">
                    <button>
                      <FaRegTrashCan size={16} className="text-red-500" />
                    </button>
                    <button>
                      <LuPencil size={17} className="text-green-500" />
                    </button>
                  </div>
                </div>
                <p className="text-green-500 py-3 text-center text-xl tracking-wider font-medium mt-7">
                  Pregnant
                </p>

                {/* Red overlay div with smooth transition */}
                <div
                  onClick={(e) => handleViewForm(e, "pregnant")}
                  className="absolute w-full h-full bg-[rgba(94,243,94,0.9)] opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 flex items-center justify-center"
                >
                  <button className="text-xl text-white font-medium tracking-wider animate-pulse">
                    Click to View
                  </button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {isOpenForm && (
        <ViewMedicationForm
          isOpen={isOpenForm}
          medicationType={medicationType}
          onClose={() => setIsOpenForm(false)}
        />
      )}
    </div>
  );
};

export default Medication;
