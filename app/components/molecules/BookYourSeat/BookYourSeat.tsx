import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import TokenPaymentDialog from '../TokenPaymentDialog/TokenPaymentDialog';

interface Seat {
  id: number;
  status: 'available' | 'booked' | 'selected';
}

const BookYourSeat: React.FC = () => {
  const [r1, setR1] = useState<Seat[]>([
    { id: 1, status: 'booked' },
    { id: 2, status: 'available' },
    { id: 3, status: 'available' },
    { id: 4, status: 'available' },
    { id: 5, status: 'available' },
    { id: 6, status: 'booked' },
    { id: 7, status: 'available' },
    { id: 8, status: 'available' },
    { id: 9, status: 'available' },
    { id: 10, status: 'booked' },
    { id: 11, status: 'available' },
    { id: 12, status: 'booked' },
    { id: 13, status: 'available' },
  ]);
  const [r2, setR2] = useState<Seat[]>([
    { id: 1, status: 'booked' },
    { id: 2, status: 'available' },
    { id: 3, status: 'available' },
    { id: 4, status: 'available' },
    { id: 5, status: 'available' },
    { id: 6, status: 'booked' },
    { id: 7, status: 'available' },
    { id: 8, status: 'available' },
    { id: 9, status: 'available' },
    { id: 10, status: 'booked' },
    { id: 11, status: 'available' },
    { id: 12, status: 'booked' },
    { id: 13, status: 'available' },
    { id: 14, status: 'booked' },
    { id: 15, status: 'available' },
    { id: 16, status: 'available' },
    { id: 17, status: 'available' },
  ]);
  const [r3, setR3] = useState<Seat[]>([
    { id: 1, status: 'booked' },
    { id: 2, status: 'available' },
    { id: 3, status: 'available' },
    { id: 4, status: 'available' },
    { id: 5, status: 'available' },
    { id: 6, status: 'booked' },
    { id: 7, status: 'available' },
    { id: 8, status: 'available' },
    { id: 9, status: 'available' },
    { id: 10, status: 'booked' },
    { id: 11, status: 'available' },
    { id: 12, status: 'booked' },
    { id: 13, status: 'available' },
    { id: 14, status: 'booked' },
    { id: 15, status: 'available' },
    { id: 16, status: 'available' },
    { id: 17, status: 'available' },
    { id: 18, status: 'available' },
    { id: 19, status: 'booked' },
    { id: 20, status: 'available' },
  ]);

  const [selectedSeat, setSelectedSeat] = useState<{
    row: number;
    seatId: number;
  } | null>(null);
  const [PaymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const handleSeatClick = (
    row: number,
    setRow: React.Dispatch<React.SetStateAction<Seat[]>>,
    seatId: number
  ) => {
    setR1((prevSeats) =>
      row === 1
        ? prevSeats.map((seat) => ({
            ...seat,
            status:
              seat.id === seatId && seat.status === 'available'
                ? 'selected'
                : seat.status === 'selected'
                ? 'available'
                : seat.status,
          }))
        : prevSeats.map((seat) => ({
            ...seat,
            status: seat.status === 'selected' ? 'available' : seat.status,
          }))
    );
    setR2((prevSeats) =>
      row === 2
        ? prevSeats.map((seat) => ({
            ...seat,
            status:
              seat.id === seatId && seat.status === 'available'
                ? 'selected'
                : seat.status === 'selected'
                ? 'available'
                : seat.status,
          }))
        : prevSeats.map((seat) => ({
            ...seat,
            status: seat.status === 'selected' ? 'available' : seat.status,
          }))
    );
    setR3((prevSeats) =>
      row === 3
        ? prevSeats.map((seat) => ({
            ...seat,
            status:
              seat.id === seatId && seat.status === 'available'
                ? 'selected'
                : seat.status === 'selected'
                ? 'available'
                : seat.status,
          }))
        : prevSeats.map((seat) => ({
            ...seat,
            status: seat.status === 'selected' ? 'available' : seat.status,
          }))
    );
    setSelectedSeat({ row, seatId });
  };

  const calculateRotation = (index: number, totalSeats: number) => {
    const angle = (180 / totalSeats) * index - 90; // Spread seats across 180 degrees
    return angle;
  };


  return (
  <>  
    <div className='mt-8 pt-8 border-t-2 border-dashed '>
      <div className="text-2xl font-bold mb-2">Book Your Seat</div>
      <div className="text-base mb-8">
        Select your seat and proceed to complete the reservation fee payment.
      </div>
      
      <div className="relative w-full items-center p-14 border border-[#2C2C2C] rounded-3xl ">
        
        <img src='/assets/images/stage-icon.svg' className='mx-auto'/>

        <div className="flex justify-center mt-8 gap-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#00CC92] rounded-[2px]"></div>
            <span className="text-sm sm:text-base">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#00CC92]/[0.3] rounded-[2px]"></div>
            <span className="text-sm sm:text-base">Booked</span>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-7 mt-10">
          {/* Row 1 */}
          <div className="flex relative justify-center gap-1 sm:gap-2 md:gap-3 transform ">
            {r1.map((seat) => (
              <img
              key={seat.id}
              src={`/assets/images/${seat.status === 'booked' ? 'seat' : seat.status === 'selected' ? 'selected-seat' : 'seat'}-icon.svg`}
              alt="Seat"
              className={`relative w-3 sm:w-5 md:w-7 lg:w-9 xl:w-10 cursor-pointer ${
                seat.status === 'booked' ? 'opacity-20' : ''
              } ${
                seat.status === 'selected'
                  ? 'trounded-full bg-[#ff791f]/[0.3] shadow-[0px_0px_20px_rgba(255,121,31,1)]'
                  : seat.status === 'available'
                  ? 'hover:shadow-[0px_0px_20px_rgba(255,121,31,1)] hover:bg-[#ff791f]/[0.3]'
                  : ''
              }`}
                // style={{ transform: `rotate(calc(56deg - ${8 * seat.id}deg))`}}
                onClick={() => handleSeatClick(1, setR1, seat.id)}
              />
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex relative justify-center gap-1 sm:gap-2 md:gap-3 mt-4 transform ">
            {r2.map((seat) => (
              <img
              key={seat.id}
              src={`/assets/images/${seat.status === 'booked' ? 'seat' : seat.status === 'selected' ? 'selected-seat' : 'seat'}-icon.svg`}
              alt="Seat"
              className={`relative w-3 sm:w-5 md:w-7 lg:w-9 xl:w-10 cursor-pointer ${
                seat.status === 'booked' ? 'opacity-20' : ''
              } ${
                seat.status === 'selected'
                  ? 'trounded-full bg-[#ff791f]/[0.3] shadow-[0px_0px_20px_rgba(255,121,31,1)]'
                  : seat.status === 'available'
                  ? 'hover:shadow-[0px_0px_20px_rgba(255,121,31,1)] hover:bg-[#ff791f]/[0.3]'
                  : ''
              }`}
                // style={{ transform: `rotate(calc(72deg - ${8 * seat.id}deg))`}}
                onClick={() => handleSeatClick(2, setR2, seat.id)}
              />
            ))}
          </div>

          {/* Row 3 */}
          <div className="flex relative justify-center gap-1 sm:gap-2 md:gap-3 mt-4 transform">
          {r3.map((seat, index) => (
              <img
                key={seat.id}
                src={`/assets/images/${seat.status === 'booked' ? 'seat' : seat.status === 'selected' ? 'selected-seat' : 'seat'}-icon.svg`}
                alt="Seat"
                className={`relative w-3 sm:w-5 md:w-7 lg:w-9 xl:w-10 cursor-pointer ${
                  seat.status === 'booked' ? 'opacity-20' : ''
                } ${
                  seat.status === 'selected'
                    ? 'trounded-full bg-[#ff791f]/[0.3] shadow-[0px_0px_20px_rgba(255,121,31,1)]'
                    : seat.status === 'available'
                    ? 'hover:shadow-[0px_0px_20px_rgba(255,121,31,1)] hover:bg-[#ff791f]/[0.3]'
                    : ''
                }`}
                // style={{ transform: `rotate(calc(84deg - ${8 * seat.id}deg))`}}
                onClick={() => handleSeatClick(3, setR3, seat.id)}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className='flex justify-center'>
        <Button size="xl" className="mt-8 w-fit bg-[#00AB7B] hover:bg-[#00AB7B]/90 mx-auto" onClick={() => setPaymentDialogOpen(true)} disabled={!selectedSeat}
        >
          Pay INR 25,000.00 and Reserve
        </Button>
      </div>
    </div>
    <TokenPaymentDialog open={PaymentDialogOpen} setOpen={setPaymentDialogOpen} />
  </>  
  );
};

export default BookYourSeat;
