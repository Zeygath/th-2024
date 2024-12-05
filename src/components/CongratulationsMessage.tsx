import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

interface CongratulationsMessageProps {
  onClose: () => void;
}

const CongratulationsMessage: React.FC<CongratulationsMessageProps> = ({ onClose }) => {
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  const detectSize = () => {
    setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
  }

  useEffect(() => {
    window.addEventListener('resize', detectSize);
    return () => {
      window.removeEventListener('resize', detectSize);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ReactConfetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={false}
        numberOfPieces={500}
      />
      <div className="bg-white p-8 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4 text-blue-600">Congratulations!</h2>
        <p className="text-xl mb-6">You have completed all the riddles!</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CongratulationsMessage;

