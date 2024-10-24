// src/components/Select.jsx

import React from 'react';
import { cn } from '../../utils/classNames';

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'block w-full rounded-md border border-transparent bg-white bg-opacity-20 py-2 px-4 text-white focus:ring-2 focus:ring-blue-400',
      className
    )}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = 'Select';

export { Select };
