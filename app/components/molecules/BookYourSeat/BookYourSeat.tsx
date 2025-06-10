import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import TokenPaymentDialog from "../TokenPaymentDialog/TokenPaymentDialog";

interface Seat {
  id: string;
  row: number;
  number: number;
  status: "available" | "booked";
}

interface FeedbackProps {
  cohortId: string;
  booked: number;
  tokenFee: number;
  setIsPaymentVerified: React.Dispatch<React.SetStateAction<string | null>>;
}

const generateSeats = (booked: number, isMobile: boolean) => {
  const seats: Seat[] = [];
  const rowConfig = isMobile
    ? [{ seats: 12 }, { seats: 13 }, { seats: 13 }, { seats: 13 }]
    : [{ seats: 13 }, { seats: 17 }, { seats: 20 }];

  // Calculate the total number of seats
  const totalSeats = rowConfig.reduce((acc, config) => acc + config.seats, 0);

  // Generate a list of random booked seat indices
  const bookedIndices = new Set<number>();
  while (bookedIndices.size < booked) {
    bookedIndices.add(Math.floor(Math.random() * totalSeats));
  }

  let seatCounter = 0;

  rowConfig.forEach((config, rowIndex) => {
    for (let i = 0; i < config.seats; i++) {
      seats.push({
        id: `${rowIndex}-${i}`,
        row: rowIndex,
        number: i + 1,
        status: bookedIndices.has(seatCounter) ? "booked" : "available",
      });
      seatCounter++;
    }
  });

  return seats;
};

const ROW_CONFIG = [
  { row: 0, seats: 13 },
  { row: 1, seats: 17 },
  { row: 2, seats: 20 },
];

const CURVE_INTENSITY = 150;
const BASE_CURVE_MULTIPLIER = 1.5;

const BookYourSeat: React.FC<FeedbackProps> = ({
  cohortId,
  booked,
  tokenFee,
  setIsPaymentVerified,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatId, setSelectedSeatId] = useState<string>();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setSeats(generateSeats(booked, isMobile));
  }, [booked, isMobile]);

  useEffect(() => {
    let processedBooked = booked;

    if (booked >= 0 && booked <= 5) {
      processedBooked = 10;
    } else if (booked >= 6 && booked <= 15) {
      processedBooked = 15;
    } else if (booked >= 16 && booked <= 25) {
      processedBooked = 25;
    } else if (booked >= 26 && booked <= 35) {
      processedBooked = 35;
    } else if (booked >= 36 && booked <= 51) {
      processedBooked = 45;
    }

    setSeats(generateSeats(processedBooked, isMobile));
  }, [booked, isMobile]);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeatId(seatId);
  };

  const [selectedSeat, setSelectedSeat] = useState<{
    row: number;
    seatId: number;
  } | null>(null);
  const [PaymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const calculateSeatPosition = (
    row: number,
    seatIndex: number,
    totalSeats: number
  ) => {
    const middleSeat = (totalSeats - 1) / 2;
    const normalizedIndex = (seatIndex - middleSeat) / totalSeats;

    const rowCurveIntensity = CURVE_INTENSITY * (1 + row * 0.1);

    const angle = normalizedIndex * Math.PI;
    const x = Math.sin(angle) * rowCurveIntensity;
    let y;
    if (row === 0) {
      y = Math.cos(angle * BASE_CURVE_MULTIPLIER) * (rowCurveIntensity * 0.6);
    } else if (row === 1) {
      y = Math.cos(angle * BASE_CURVE_MULTIPLIER) * (rowCurveIntensity * 0.7);
    } else {
      y = Math.cos(angle * BASE_CURVE_MULTIPLIER) * (rowCurveIntensity * 0.8);
    }

    const rowY = row * 50;
    const rowZ = row * 1;

    let rotationAngle;
    if (row === 0) {
      rotationAngle = `calc(36deg - ${6 * seatIndex}deg)`;
    } else if (row === 1) {
      rotationAngle = `calc(40deg - ${5 * seatIndex}deg)`;
    } else {
      rotationAngle = `calc(38deg - ${4 * seatIndex}deg)`;
    }

    return {
      transform: `translate3d(${x}px, ${
        y + rowY
      }px, ${-rowZ}px) rotate(${rotationAngle})`,
    };
  };

  const calculateRotation = (index: number, totalSeats: number) => {
    const angle = (180 / totalSeats) * index - 90; // Spread seats across 180 degrees
    return angle;
  };

  const formatAmount = (value: number | undefined) =>
    value !== undefined
      ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
          Math.round(value)
        )
      : "--";

  return (
    <>
      <div className="mt-8 pt-8 border-t-2 border-dashed ">
        <div className="text-2xl font-bold mb-2">Book Your Seat</div>
        <div className="text-base mb-8">
          Select your seat and proceed to complete the reservation fee payment.
        </div>

        <div className="sm:relative w-full items-center py-14 border border-[#2C2C2C] rounded-3xl ">
          <img src="/assets/images/stage-icon.svg" className="mx-auto px-14" />

          <div className="flex justify-center mt-8 gap-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#00CC92]/[0.3] rounded-[2px]"></div>
              <span className="text-sm sm:text-base">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#00CC92] rounded-[2px]"></div>
              <span className="text-sm sm:text-base">Available</span>
            </div>
          </div>
          <div className="sm:hidden sm:block flex flex-col gap-6 px-3 h-[125px] sm:h-[460px] mt-16 sm:mt-0">
            {[
              { row: 0, seats: 13 },
              { row: 1, seats: 13 },
              { row: 2, seats: 13 },
              { row: 3, seats: 13 },
            ].map((rowConfig) => (
              <div
                key={rowConfig.row}
                className="w-full flex gap-2.5 justify-center"
              >
                {Array.from({ length: rowConfig.seats }).map((_, seatIndex) => {
                  const seatId = `${rowConfig.row}-${seatIndex}`;
                  const seat = seats.find((s) => s.id === seatId);
                  const isSelected = selectedSeatId === seatId;
                  const isBooked = seat?.status === "booked";

                  // Add gap between seatIndex 1 & 2 and 10 & 11
                  const marginRight =
                    seatIndex === 1 || seatIndex === 10
                      ? "mr-2 sm:mr-8 md:mr-10"
                      : "";

                  return (
                    <img
                      key={seatId}
                      src={`/assets/images/${
                        isBooked
                          ? "seat"
                          : isSelected
                          ? "selected-seat"
                          : "seat"
                      }-icon.svg`}
                      className={`
                        w-auto h-3 sm:h-4 md:h-5 lg:h-6 xl:h-7 rounded
                        -mx-[4px] sm:-mx-[6px] md:-mx-[5px] lg:-mx-[4px] xl:-mx-[3px]
                        ${
                          rowConfig.row === 0 && seatIndex === 6
                            ? "opacity-0"
                            : ""
                        }
                        ${marginRight}
                        ${
                          isSelected
                            ? "bg-[#ff791f]/[0.3] shadow-[0px_0px_20px_rgba(255,121,31,1)]"
                            : !isBooked
                            ? "hover:shadow-[0px_0px_20px_rgba(255,121,31,1)] hover:bg-[#ff791f]/[0.3]"
                            : "opacity-20 cursor-default"
                        }
                      `}
                      onClick={() => !isBooked && handleSeatSelect(seatId)}
                      title={`Row ${rowConfig.row + 1}, Seat ${seatIndex + 1}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="hidden sm:block relative h-[460px] perspective-1000 -mt-48">
            {ROW_CONFIG.map((rowConfig) => (
              <div
                key={rowConfig.row}
                className="absolute w-full flex justify-center"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {Array.from({ length: rowConfig.seats }).map((_, seatIndex) => {
                  const seatId = `${rowConfig.row}-${seatIndex}`;
                  const seat = seats.find((s) => s.id === seatId);
                  const isSelected = selectedSeatId === seatId;
                  const isBooked = seat?.status === "booked";

                  return (
                    <img
                      key={seatId}
                      src={`/assets/images/${
                        isBooked
                          ? "seat"
                          : isSelected
                          ? "selected-seat"
                          : "seat"
                      }-icon.svg`}
                      className={`
                    'w-auto h-3 sm:h-4 md:h-5 lg:h-6 xl:h-7 rounded -mx-[10px] sm:-mx-[12px] md:-mx-[10px] lg:-mx-[5px] xl:-mx-[4px] transition-all transform hover:scale-110 
                    ${
                      isSelected
                        ? "bg-[#ff791f]/[0.3] shadow-[0px_0px_20px_rgba(255,121,31,1)]"
                        : !isBooked
                        ? " hover:shadow-[0px_0px_20px_rgba(255,121,31,1)] hover:bg-[#ff791f]/[0.3]"
                        : "opacity-20 cursor-disabled"
                    }
                  `}
                      style={{
                        ...calculateSeatPosition(
                          rowConfig.row,
                          seatIndex,
                          rowConfig.seats
                        ),
                      }}
                      onClick={() => !isBooked && handleSeatSelect(seatId)}
                      //disabled={isBooked}
                      title={`Row ${rowConfig.row + 1}, Seat ${seatIndex + 1}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            size="xl"
            className="mt-8 w-fit bg-[#00AB7B] hover:bg-[#00AB7B]/90 mx-auto"
            onClick={() => setPaymentDialogOpen(true)}
            disabled={!selectedSeatId}
          >
            Pay INR ₹{formatAmount(tokenFee)}.00 and Reserve
          </Button>
        </div>
      </div>

      <TokenPaymentDialog
        cohortId={cohortId}
        open={PaymentDialogOpen}
        setOpen={setPaymentDialogOpen}
        setIsPaymentVerified={setIsPaymentVerified}
      />
    </>
  );
};

export default BookYourSeat;
