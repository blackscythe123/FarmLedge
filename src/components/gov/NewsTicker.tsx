import React from 'react';
import { Bell } from 'lucide-react';

const NewsTicker = () => {
  return (
    <div className="bg-gray-100 border-b border-gray-200 py-2 overflow-hidden flex items-center shadow-inner">
      <div className="container mx-auto flex items-center px-4">
        <div className="bg-secondary text-secondary-foreground px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-sm mr-4 flex items-center gap-2 whitespace-nowrap shadow-sm z-10">
            <Bell className="w-3 h-3" />
            Latest Updates
        </div>
        <div className="flex-1 overflow-hidden relative h-6 mask-linear-fade">
            <div className="animate-marquee whitespace-nowrap absolute top-0 left-0 flex items-center h-full text-sm text-gray-800 font-medium">
                <span className="mx-8 flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full inline-block"></span> Registration for Kharif 2024 season is now open.</span>
                <span className="mx-8 flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full inline-block"></span> New MSP rates for Paddy announced by the Government.</span>
                <span className="mx-8 flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full inline-block"></span> AgriTruthChain platform maintenance scheduled for Sunday 2 AM - 4 AM.</span>
                <span className="mx-8 flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full inline-block"></span> Farmers are advised to update their e-KYC details immediately.</span>
                <span className="mx-8 flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full inline-block"></span> Weather alert: Heavy rainfall expected in coastal districts.</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
