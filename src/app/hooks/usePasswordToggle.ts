"use client";
import { useState } from 'react';

export const usePasswordToggle = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => setVisible(!visible);

  const InputType = visible ? 'text' : 'password';
  const IconSrc = visible ? '/img/eye.png' : '/img/close_eye.png';
  const IconAlt = visible ? 'Hide password' : 'Show password';

  return {
    visible,
    toggleVisibility,
    InputType,
    IconSrc,
    IconAlt,
  };
};