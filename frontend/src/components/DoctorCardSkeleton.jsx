import React from "react";

// Gray placeholder shaped exactly like DoctorCard, shown while doctors are
// loading. Feels faster/more intentional than a spinner because the user
// can already see where content is about to appear.
const DoctorCardSkeleton = () => {
  return (
    <div className="border-2 border-blue-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="w-full aspect-[4/3] bg-gray-200"></div>
      <div className="p-3 sm:p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
        <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default DoctorCardSkeleton;
