import React from 'react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Badge } from '~/components/ui/badge';

const EmergencyContactDetails: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 mt-8">
      <Badge size="xl" className='flex-1 bg-[#00AB7B]/[0.2] text-[#00AB7B] text-center '>Emergency Contact Details</Badge>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="emergencyFirstName" className="text-base font-normal pl-3">First Name</Label>
          <Input id="emergencyFirstName" placeholder="John" />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="emergencyLastName" className="text-base font-normal pl-3">Last Name</Label>
          <Input id="emergencyLastName" placeholder="Doe" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="emergencyContact" className="text-base font-normal pl-3">Contact No.</Label>
          <Input id="emergencyContact" placeholder="+91 00000 00000" />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="relationship" className="text-base font-normal pl-3">Relationship with Contact</Label>
          <Input id="relationship" placeholder="Father/Mother/Sibling" />
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactDetails;
