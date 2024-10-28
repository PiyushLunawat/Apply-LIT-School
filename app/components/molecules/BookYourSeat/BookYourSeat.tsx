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
  const [PaymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const handleR1SeatClick = (seatId: number) => {
    setR1((prevSeats) =>
      prevSeats.map((seat) =>
        seat.id === seatId && seat.status === 'available'
          ? { ...seat, status: 'selected' }
          : seat
      )
    );
  };

  const handleR2SeatClick = (seatId: number) => {
    setR2((prevSeats) =>
      prevSeats.map((seat) =>
        seat.id === seatId && seat.status === 'available'
          ? { ...seat, status: 'selected' }
          : seat
      )
    );
  };
  const handleR3SeatClick = (seatId: number) => {
    setR3((prevSeats) =>
      prevSeats.map((seat) =>
        seat.id === seatId && seat.status === 'available'
          ? { ...seat, status: 'selected' }
          : seat
      )
    );
  };

  const calculateRotation = (index: number, totalSeats: number) => {
    const angle = (180 / totalSeats) * index - 90; // Spread seats across 180 degrees
    return angle;
  };

  const handleSeatClick = (row: Seat[], setRow: React.Dispatch<React.SetStateAction<Seat[]>>, seatId: number) => {
    setRow((prevSeats) =>
      prevSeats.map((seat) =>
        seat.id === seatId && seat.status === 'available'
          ? { ...seat, status: 'selected' }
          : seat
      )
    );
  };

  return (
  <>  
    <div className={`flex flex-col rounded-2xl px-6 py-8 max-w-[1216px] mx-auto bg-[#09090B] text-white ${true ? ' shadow-[0px_4px_32px_rgba(0,163,255,0.2)]' : 'shadow-[0px_4px_32px_rgba(255,80,61,0.2)]'}`}>
      <div className="text-2xl font-bold mb-4">Book Your Seat</div>
      <div className="text-base mb-8">
        Select your seat and proceed to complete the reservation fee payment.
      </div>
      
      <div className="relative w-full items-center p-14 border border-[#2C2C2C] rounded-3xl ">
        
        <img src='/assets/images/stage-icon.svg' className='mx-auto'/>

        <div className="flex justify-center mt-8 gap-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00CC92] rounded-sm"></div>
            <span className="text-sm sm:text-base">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#FFFFFF66] rounded-sm"></div>
            <span className="text-sm sm:text-base">Available</span>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-7 mt-[120px]">
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
                style={{ transform: `rotate(calc(56deg - ${8 * seat.id}deg))`}}
                onClick={() => handleR1SeatClick(seat.id)}
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
                style={{ transform: `rotate(calc(72deg - ${8 * seat.id}deg))`}}
                onClick={() => handleR2SeatClick(seat.id)}
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
                style={{ transform: `rotate(calc(84deg - ${8 * seat.id}deg))`}}
                onClick={() => handleR2SeatClick(seat.id)}
              />
            ))}
          </div>
        </div>
      </div>
      
      <Button size="xl" className="mt-8 w-fit bg-[#00AB7B] mx-auto" onClick={() => setPaymentDialogOpen(true)}>
        Pay INR 25,000.00 and Reserve
      </Button>
    </div>
    <TokenPaymentDialog open={PaymentDialogOpen} setOpen={setPaymentDialogOpen} />
  </>  
  );
};

export default BookYourSeat;
