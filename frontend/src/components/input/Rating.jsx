import React, { useState } from 'react';
import { HiStar } from 'react-icons/hi';

const Rating = ({
  maxStars = 5,
  value = 0,
  onChange,
  readOnly = false,
}) => {
  const [hoverValue, setHoverValue] = useState(0);
  const [clicked, setClicked] = useState(false);

  const handleClick = (rating) => {
    if (!readOnly && onChange) {
      onChange(rating);
      setClicked(true);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!readOnly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(0);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex gap-2 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        onMouseLeave={handleMouseLeave}
      >
        {[...Array(maxStars)].map((_, index) => {
          const starValue = index + 1;
          return (
            <span
              key={index}
              className={`text-3xl transition-colors ${
                starValue <= (hoverValue || value)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
            >
              <HiStar />
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default Rating;
