// src/components/Input.jsx

import React from 'react';
import { cn } from '../../utils/classNames';

const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'block w-full rounded-md border border-transparent bg-white bg-opacity-20 py-2 px-4 text-white placeholder-white focus:ring-2 focus:ring-blue-400',
      className
    )}
    {...props}
  />
));

Input.displayName = 'Input';

export { Input };
