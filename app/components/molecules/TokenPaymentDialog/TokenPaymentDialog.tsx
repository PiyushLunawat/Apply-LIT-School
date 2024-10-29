import * as React from 'react';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'; 
import { Button } from '~/components/ui/button'; 
import { Label } from '~/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import ImageUpload from '~/components/ui/ImageUpload';
import { useNavigate } from '@remix-run/react';

interface TokenPaymentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TokenPaymentDialog: React.FC<TokenPaymentDialogProps> = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = React.useState<'cash' | 'bank'>('cash');
  const [secondDialogOpen, setSecondDialogOpen] = React.useState(false);

  const handleNextClick = () => {
    setSecondDialogOpen(true); // Open the second dialog when "Next" is clicked
  };

  const handleSubmit = () => {
    navigate('../dashboard/application-step-3');
  };

  return (
  <>  
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[480px] mx-4 bg-[#09090b] text-white rounded-lg px-8 py-12 text-center shadow-[0px_4px_32px_0px_rgba(0,0,0,0.75)]">
        <div className="flex justify-center mb-6">
          <img src='/assets/images/lit-cash-icon.svg' className="w-[60px]" />
        </div>
        
        <div className="text-base font-medium ">STEP 01</div>
        <div className="text-3xl font-semibold mb-4">Select Payment Mode</div>

        {/* Radio Group for Payment Selection */}
        <RadioGroup
          className="flex flex-col gap-4"
          value={selectedPayment}
          onValueChange={(value) => setSelectedPayment(value as 'cash' | 'bank')}
        >
          {/* Cash Payment Option */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className='text-2xl'>Cash</Label>
            </div>
              <div className="text-base text-muted-foreground text-start">
                You may make a cash payment in person, following which you will receive a receipt. On uploading a soft copy of the receipt on the portal you will be able to access your dashboard.
              </div>
          </div>

          {/* Bank Transfer Payment Option */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="bank-transfer" id="bank-transfer" />
              <Label htmlFor="bank-transfer" className='text-2xl'>Bank Transfer</Label>
            </div>
              <div className="text-base text-muted-foreground text-start">
                You will be provided LIT School’s bank account details. You may make a NEFT transaction to the same account. Once you have made a transaction please upload an acknowledgement receipt.
              </div>
          </div>
        </RadioGroup>

        {/* Next Button */}
        <Button size="xl" variant="outline" className="mt-8 w-fit border-[#00CC92] text-[#00CC92] mx-auto" onClick={handleNextClick}>Next</Button>
      </DialogContent>
    </Dialog>
    <Dialog open={secondDialogOpen} onOpenChange={setSecondDialogOpen}>
        <DialogContent className="max-w-[480px] mx-4 bg-[#09090b] text-white rounded-lg px-8 py-12 text-center shadow-[0px_4px_32px_0px_rgba(0,0,0,0.75)] h-[600px] overflow-hidden overflow-y-auto">
          <ArrowLeft className='w-6 h-6 cursor-pointer' onClick={() => setSecondDialogOpen(false)} />
          <div className="flex justify-center mb-6">
            <img src='/assets/images/lit-cash-icon.svg' className="w-[60px]" />
          </div>
        
          <div className="text-base font-medium ">STEP 02</div>
        <div className="text-3xl font-semibold mb-4">Upload your Payment Receipt</div>

          {/* Conditional Rendering Based on Selected Payment Method */}
          <RadioGroup>{selectedPayment === 'cash' ? (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cash" id="cash" checked />
                  <Label htmlFor="cash" className='text-2xl'>Cash</Label>
                </div>
                <div className="text-base text-muted-foreground text-start">
                  Uploading a soft copy of the acknowledgement receipt issued to you by our fee manager to access your dashboard.
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="bank-transfer" id="bank-transfer" checked />
                  <Label htmlFor="bank-transfer" className='text-2xl'>Bank Transfer</Label>
                </div>
                <div className=" text-start">
                  <div className="flex justify-start gap-2 mt-4 p-4 border border-[#2C2C2C] rounded-md">
                    <div className="flex flex-col text-left">
                      <p className='text-base'>LITschool</p>
                      <p className='text-sm'>Account No.: 123456789</p>
                      <p className='text-sm'>IFS Code: ABCD0001234</p>
                      <p className='text-sm'>Branch: Sadashivnagar</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Uploading a soft copy of the acknowledgement receipt issued to you by our fee manager to access your dashboard.
                  </p>
                </div>
              </div>
            </>
          )}</RadioGroup>
          <ImageUpload />

          {/* Submit Button */}
          <Button size="xl" variant="outline" className="mt-8 w-fit border-[#00CC92] text-[#00CC92] mx-auto" onClick={handleSubmit}>Submit</Button>
        </DialogContent>
      </Dialog>
  </>

  );
};

export default TokenPaymentDialog;
