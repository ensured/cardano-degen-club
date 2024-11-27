import React from 'react';
import { Skeleton } from './ui/skeleton'; // Assuming you have a Skeleton component
import { Separator } from "@radix-ui/react-dropdown-menu"
const skeletons = 9
const FavoritesSkeleton = () => {
  return (
    <div className="flex flex-col flex-wrap rounded-lg">
      {Array(skeletons) // Adjust the number of skeletons as needed
        .fill(null)
        .map((_, index) => (
          <div key={index} className="h-[65.797px] overflow-auto">
            <div className="flex items-center gap-3 p-2.5 transition-colors duration-200">
              <Skeleton className="m-0 size-[44px] rounded-full p-[20px]" /> {/* Image skeleton */}
              <div className="relative flex w-full select-none items-center justify-between gap-3">
                  <Skeleton className="line-clamp-2 h-5 w-full overflow-auto rounded-md bg-muted md:h-6" /> {/* Text skeleton */}
                <Skeleton className="size-8 rounded-lg border" /> {/* Button skeleton */}
              </div>
            </div>
            {index < skeletons - 1 && ( // Adjust the number of separators based on the number of skeletons
              <Separator className="h-px bg-zinc-200 dark:bg-zinc-800" />
            )}
          </div>
        ))}
    </div>
  );
};

export default FavoritesSkeleton;