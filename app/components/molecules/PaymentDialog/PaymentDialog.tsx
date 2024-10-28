import * as React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface DialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    type: string;
    mail: string;
  }

const PaymentSuccessDialog: React.FC<DialogProps> = ({ open, setOpen, type, mail }) => (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent className="max-w-[480px] mx-4 bg-[#09090b] text-white rounded-lg px-8 py-16 text-center shadow-[0px_4px_32px_0px_rgba(0,0,0,0.75)]
">
      <CheckCircle className="w-12 h-12 text-[#00CC92] mx-auto" />
      <div>
        <div className="text-3xl font-bold ">Payment Successful!</div>
        <div className='text-base font-normal py-8'>
          {type === 'step1' ?
           `Your payment of INR 500.00 was successful. A payment receipt has been emailed to ${mail}` :
           `Your seat reservation fee payment of INR 25,00.00 was successful. A payment receipt has been emailed to ${mail}`}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="xl" className="w-fit mx-auto border-[#00CC92] text-[#00CC92] hover:border-[#00CC92]/90 hover:text-[#00CC92]/90 ">Continue to Dashboard</Button>
      </div>
    </DialogContent>
  </Dialog>
);

const PaymentFailedDialog: React.FC<DialogProps> = ({ open, setOpen, type, mail }) => (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent className="max-w-[480px] mx-4 bg-[#09090b] text-white rounded-lg px-8 py-16 text-center shadow-[0px_4px_32px_0px_rgba(0,0,0,0.75)]
">
      <AlertCircle className="w-12 h-12 text-orange-500 mx-auto " />
      <div>
        <div className="text-3xl font-bold ">Oops!</div>
        <div className="mt-2 text-[#FF791F] text-2xl font-medium text-center">
          Looks like your payment did not go through.
        </div>
        <div className='text-base font-normal py-8'>
          {type === 'step1' ?
           `Your payment of INR 500.00 was unsuccessful.` :
           `Your seat reservation fee payment of INR 25,000.00 was unsuccessful.`}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Button size="xl" className="w-fit mx-auto bg-[#FF791F] hover:bg-[#FF791F]/90">
          Try Again
        </Button>
        <Button variant="link" className="">Cancel</Button>
      </div>
    </DialogContent>
  </Dialog>
);

export { PaymentSuccessDialog, PaymentFailedDialog };
