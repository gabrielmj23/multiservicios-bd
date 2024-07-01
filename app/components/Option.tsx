import React from 'react';

interface OptionProps {
  name: string;
  imageSrc: string;
}

const Option: React.FC<OptionProps> = ({ name, imageSrc }) => {
  return (
    <div className="w-60 h-60 bg-white rounded-lg flex flex-col items-center justify-center p-2 shadow">
      <div className="text-center font-bold mb-2">{name}</div>
      <img src={imageSrc} alt={name} className="w-40 h-40 object-cover" />
    </div>
  );
};

export default Option;