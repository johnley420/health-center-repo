import { CalendarDate, parseDate } from "@internationalized/date";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Checkbox,
  DateInput,
  Input,
} from "@nextui-org/react";
import React from "react";

type propsTypes = {
  isOpen: boolean;
  onClose: () => void;
  medicationType: string;
  data: any;
};

const ViewMedicationForm = ({
  isOpen,
  onClose,
  medicationType,
  data,
}: propsTypes) => {
  // Define formFields with arrays for datePrenatalVisit, dateNextPrenatalVisit, and LMPData
  const formFields = {
    LMPData: [
      { label: "G (Gravida)", value: "gravida" },
      { label: "P (Parity)", value: "parity" },
      { label: "A (Abortion)", value: "abortion" },
      { label: "S (Stillbirth)", value: "stillbirth" },
    ],
    datePrenatalVisit: [
      { label: "1st Visit (up to 12 weeks + 6 days)", value: "visit1" },
      { label: "2nd Visit (13 to 27 weeks + 6 days)", value: "visit2" },
      { label: "3rd Visit (> 28 weeks)", value: "visit3" },
      { label: "4th Visit", value: "visit4" },
    ],
    dateNextPrenatalVisit: [
      { label: "Next Visit 1", value: "nextVisit1" },
      { label: "Next Visit 2", value: "nextVisit2" },
      { label: "Next Visit 3", value: "nextVisit3" },
    ],
    seenByDoctor: [
      { label: "A. Previous Dose", value: "seenPrevious" },
      { label: "B. Current Dose", value: "seenCurrent" },
    ],
  };

  console.log("viw", data);

  return (
    <div>
      <Modal
        scrollBehavior="outside"
        size="5xl"
        isOpen={isOpen}
        onOpenChange={onClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {medicationType}
              </ModalHeader>
              <ModalBody className="flex flex-col items-center justify-center gap-4 py-3">
                <h1 className="text-2xl font-bold pl-3">Prenatal Visit Form</h1>

                {/* LMP Section */}
                <div className="w-full border-b pb-7">
                  <h1 className="text-xl font-semibold mb-3">LMP</h1>
                  <div className="w-full flex justify-between">
                    {formFields.LMPData.map((item, index) => (
                      <Checkbox
                        key={index}
                        defaultSelected
                        className="text-xl font-medium tracking-wider"
                      >
                        {item.label}
                      </Checkbox>
                    ))}
                  </div>
                  <div className="mt-9 flex flex-col gap-3">
                    <DateInput
                      size="lg"
                      color="default"
                      label={"EDC (Expected Date of Confinement)"}
                      isRequired
                      defaultValue={parseDate("2024-04-04")}
                      placeholderValue={new CalendarDate(1995, 11, 6)}
                    />
                  </div>
                </div>
                {/* End LMP Section */}

                {/* Actual date of prenatal confinement */}
                <div className="w-full flex gap-7 mt-3 pb-4 border-b">
                  <div className="w-1/2">
                    <h1 className="text-xl font-semibold mb-3">
                      A) Actual date of prenatal confinement
                    </h1>

                    <div className="flex flex-col gap-3 w-full">
                      {formFields.datePrenatalVisit.map((item, index) => (
                        <DateInput
                          key={index}
                          size="lg"
                          className="w-full"
                          color="default"
                          label={item.label}
                          isRequired
                          defaultValue={parseDate("2024-04-04")}
                          placeholderValue={new CalendarDate(1995, 11, 6)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Date of next prenatal visit */}
                  <div className="w-1/2 ">
                    <h1 className="text-xl font-semibold mb-3">
                      B) Date of Next Prenatal Visit
                    </h1>

                    <div className="flex flex-col gap-3 w-full">
                      {formFields.dateNextPrenatalVisit.map((item, index) => (
                        <DateInput
                          key={index}
                          size="lg"
                          className="w-full"
                          color="default"
                          label={item.label}
                          isRequired
                          defaultValue={parseDate("2024-04-04")}
                          placeholderValue={new CalendarDate(1995, 11, 6)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full flex items-start gap-5">
                  <div className="w-1/2">
                    {/* Rist codes (Yes & Code) */}
                    <Input
                      type="text"
                      size="lg"
                      label="Rist Codes (Yes & Code)"
                      placeholder="Enter risk code"
                      className="w-full"
                    />
                    {/* With Birth Plan (Yes & Date) */}
                    <Input
                      type="text"
                      size="lg"
                      label="With Birth Plan (Yes & Code)"
                      placeholder="Enter date"
                      className="w-full mt-3"
                    />
                  </div>
                  <div className="w-1/2">
                    <Input
                      type="text"
                      size="lg"
                      label="Seen By a Doctor/Dentist"
                      className="w-full"
                    />
                    <h1 className="mt-5 mb-3 text-lg font-medium">
                      TD Immunization Dose
                    </h1>
                    <Input
                      type="text"
                      size="lg"
                      label="A. Previous"
                      className="w-full"
                    />
                    <Input
                      size="lg"
                      type="text"
                      label="B. Current"
                      className="w-full mt-3"
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ViewMedicationForm;
