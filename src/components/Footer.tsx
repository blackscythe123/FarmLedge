import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink 
} from "lucide-react";

import odishaLogo from "@/assets/odisha-logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-[#1b1b1b] text-white border-t-4 border-[#fbbf24] font-sans">
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1: About Department */}
          <div>
             <h3 className="text-lg font-bold text-yellow-500 mb-4 uppercase border-b border-gray-700 pb-2">About Us</h3>
             <ul className="space-y-2 text-sm text-gray-300">
               <li><Link to="/about" className="hover:text-white hover:underline">About Department</Link></li>
               <li><Link to="/structure" className="hover:text-white hover:underline">Organizational Structure</Link></li>
               <li><Link to="/directory" className="hover:text-white hover:underline">Directory</Link></li>
               <li><Link to="/history" className="hover:text-white hover:underline">History & Mandate</Link></li>
             </ul>
             
             <div className="mt-6 flex items-center gap-3">
                <div className="bg-white p-1 rounded">
                  <img src={odishaLogo} alt="Odisha Govt" className="h-12 w-12 object-contain" />
                </div>
                <p className="text-xs text-gray-500">Department of Agriculture & <br/> Farmers' Empowerment</p>
             </div>
          </div>

          {/* Column 2: Quick Links / Schemes */}
          <div>
             <h3 className="text-lg font-bold text-yellow-500 mb-4 uppercase border-b border-gray-700 pb-2">Schemes & Services</h3>
             <ul className="space-y-2 text-sm text-gray-300">
               <li><Link to="/gov-schemes" className="hover:text-white hover:underline">KALIA Scheme</Link></li>
               <li><Link to="/join" className="hover:text-white hover:underline">Farmer Registration</Link></li>
               <li><Link to="/price-prediction" className="hover:text-white hover:underline">Market Price Information</Link></li>
               <li><Link to="/weather-alerts" className="hover:text-white hover:underline">Agro-Advisory & Weather</Link></li>
               <li><a href="https://pmkissansamman.gov.in" target="_blank" className="hover:text-white hover:underline flex items-center gap-1">PM Kisan <ExternalLink className="w-3 h-3"/></a></li>
             </ul>
          </div>

          {/* Column 3: Important Links */}
          <div>
             <h3 className="text-lg font-bold text-yellow-500 mb-4 uppercase border-b border-gray-700 pb-2">Important Links</h3>
             <ul className="space-y-2 text-sm text-gray-300">
               <li><a href="https://odisha.gov.in" className="hover:text-white hover:underline" target="_blank">Odisha Government Portal</a></li>
               <li><a href="https://agri.odisha.gov.in" className="hover:text-white hover:underline" target="_blank">Agri Odisha Official</a></li>
               <li><a href="https://milletsodisha.com" className="hover:text-white hover:underline" target="_blank">Odisha Millets Mission</a></li>
               <li><Link to="/tenders" className="hover:text-white hover:underline">Tenders & Notifications</Link></li>
               <li><Link to="/support" className="hover:text-white hover:underline">Grievance Redressal</Link></li>
             </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
             <h3 className="text-lg font-bold text-yellow-500 mb-4 uppercase border-b border-gray-700 pb-2">Contact Details</h3>
             <div className="space-y-4 text-sm text-gray-300">
               <div className="flex items-start gap-3">
                 <Building2 className="w-5 h-5 text-yellow-500 mt-0.5" />
                 <div>
                   <p className="font-bold text-white">Krushi Bhavan</p>
                   <p>Keshari Nagar, Bhubaneswar</p>
                   <p>Odisha - 751001</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-3">
                 <Phone className="w-5 h-5 text-yellow-500" />
                 <p>155333 / 0674-2395532</p>
               </div>

               <div className="flex items-center gap-3">
                 <Mail className="w-5 h-5 text-yellow-500" />
                 <p>agrsec.or@nic.in</p>
               </div>

               <div className="flex items-center gap-3">
                 <Globe className="w-5 h-5 text-yellow-500" />
                 <p>agri.odisha.gov.in</p>
               </div>
             </div>
          </div>
        </div>

        {/* Footer Bottom Links */}
        <div className="border-t border-gray-700 pt-6 mt-6">
           <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 mb-4 uppercase tracking-wider">
              <Link to="/disclaimer" className="hover:text-white px-2 border-r border-gray-600 last:border-0">Disclaimer</Link>
              <Link to="/privacy" className="hover:text-white px-2 border-r border-gray-600 last:border-0">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white px-2 border-r border-gray-600 last:border-0">Terms of Use</Link>
              <Link to="/sitemap" className="hover:text-white px-2 border-r border-gray-600 last:border-0">Screen Reader Access</Link>
              <a href="#" className="hover:text-white px-2 border-r border-gray-600 last:border-0">Accessibility Statement</a>
           </div>
           
           <div className="text-center text-xs text-gray-500">
              <p className="mb-2">Content Owned by Department of Agriculture & Farmers' Empowerment, Government of Odisha.</p>
              <p>Site Designed and Developed by <span className="text-emerald-500 font-bold">FarmLedge Team</span>.</p>
              <p className="mt-2 text-[10px] opacity-60">Last Updated: 09-Dec-2024</p>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;