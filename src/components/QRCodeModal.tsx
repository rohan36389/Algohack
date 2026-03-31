import React, { useEffect } from 'react';
import { X, Copy, ExternalLink } from 'lucide-react';
import { cn } from '../utils/classnames';
import toast from 'react-hot-toast';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataUrl: string; // The algorand:// URI
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, dataUrl }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(dataUrl);
    toast.success("Payment request link copied!");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className={cn(
        "relative glass-card w-full max-w-sm p-6 overflow-hidden flex flex-col items-center text-center transform transition-all",
        "animate-in fade-in zoom-in-95 duration-200"
      )}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">Request Payment</h2>
        
        <div className="bg-white p-4 rounded-xl mb-6">
            {/* Displaying QR using an image from an API or canvas would typically happen here. 
                For the hackathon, we will render a placeholder or use an external API like QuickChart 
                since we can't easily install a standard QR library if it wasn't requested in package dependencies, 
                wait, no, I can just use a generic url. 
                Using quickchart.io to generate it visually */
            }
            <img 
                src={`https://quickchart.io/qr?text=${encodeURIComponent(dataUrl)}&size=200`} 
                alt="Payment QR Code" 
                className="w-48 h-48"
            />
        </div>

        <p className="text-sm text-gray-400 mb-6 px-4">
          Scan this QR code with Pera Wallet or use the link below to pay your share.
        </p>

        <div className="flex gap-3 w-full">
          <button 
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
          >
            <Copy size={16} /> Copy URL
          </button>
          <a 
            href={dataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-background py-2.5 rounded-xl transition-colors font-semibold text-sm shadow-[0_0_15px_rgba(0,212,255,0.2)]"
          >
            Open App <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};
