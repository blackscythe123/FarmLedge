import React from 'react';
import { Link } from 'react-router-dom';

const GovHeader = () => {
  return (
    <header className="bg-white py-4 px-4 md:px-8 shadow-sm border-b-4 border-primary relative z-40">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-4 group">
            {/* Emblem Placeholder - In a real app, this would be the Odisha Govt Logo */}
            <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 transition-transform group-hover:scale-105">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Seal_of_Odisha.png/1200px-Seal_of_Odisha.png" 
                    alt="Government of Odisha Emblem" 
                    className="w-full h-full object-contain"
                />
            </div>
            
            <div className="text-center md:text-left">
                <h2 className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">Government of Odisha</h2>
                <h1 className="text-lg md:text-2xl lg:text-3xl font-black text-primary font-serif leading-tight">
                    Department of Agriculture & <br className="hidden md:block" /> Farmers' Empowerment
                </h1>
            </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
            <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
                alt="Satyameva Jayate" 
                className="h-14 object-contain opacity-80 grayscale hover:grayscale-0 transition-all"
            />
             {/* Agri Truth Chain Logo / Branding */}
             <div className="border-l-2 border-gray-200 pl-6">
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Powered By</p>
                    <p className="text-xl font-bold text-secondary tracking-tight">AgriTruthChain</p>
                </div>
             </div>
        </div>
      </div>
    </header>
  );
};

export default GovHeader;
