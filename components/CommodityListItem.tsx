import React from 'react';
import type { Commodity } from '../types';

interface CommodityListItemProps {
  commodity: Commodity;
  onSelect: (commodity: Commodity) => void;
  isSelected: boolean;
}

export const CommodityListItem: React.FC<CommodityListItemProps> = ({ commodity, onSelect, isSelected }) => {
  const baseClasses = "w-full p-3 text-left rounded-md flex items-center transition-colors duration-200 text-gray-700";
  const selectedClasses = "bg-red-100 font-semibold";
  const unselectedClasses = "hover:bg-gray-100";

  return (
    <button
      onClick={() => onSelect(commodity)}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
    >
      <span className="text-2xl mr-4">{commodity.emoji}</span>
      <span>{commodity.name}</span>
    </button>
  );
};