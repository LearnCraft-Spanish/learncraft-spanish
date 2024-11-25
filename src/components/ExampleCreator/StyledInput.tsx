import React from 'react';

interface StyledInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // placeholder?: string,
  type?: string;
  name: string;
  className?: string;
  // disabled?: boolean,
}

export default function StyledInput({
  value,
  onChange,
  type = 'text',
  name,
  className = '',
}: StyledInputProps) {
  return (
    <div className="customFormInput">
      <label htmlFor={name}>Spanish Audio Link</label>
      <input
        id={name}
        // name={name} // This is not needed b/c we use custom code for form submit
        type={type}
        value={value}
        onChange={onChange}
        className={className}
      />
    </div>
  );
}
