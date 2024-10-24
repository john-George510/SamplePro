// src/components/Modal.jsx

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../utils/classNames';
import { Button } from './Button';

const Modal = ({ children, title, isOpen, onClose }) => (
  <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
    <DialogPrimitive.Content className="fixed top-1/2 left-1/2 max-h-full w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white bg-opacity-10 backdrop-blur-md p-6 shadow-lg focus:outline-none">
      <DialogPrimitive.Title className="text-xl font-semibold text-white mb-4">
        {title}
      </DialogPrimitive.Title>
      {children}
      <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Root>
);

export { Modal };
