import React, { useState } from 'react';

const Note = () => {
  const [ptn, setPtn] = useState('-');
  const onClickHandler = () => {
    setPtn(ptn === '-' ? 'x' : '-');
  };
  const handleKeyDown = (evt) => {
    const { key } = evt;
    switch (key) {
      case ' ':
        setPtn(ptn === '-' ? 'x' : '-');
        break;

      case 'Backspace':
      case 'Delete':
        setPtn('-');
        break;

      case 'r':
      case 'R':
      case 'Enter':
        setPtn('R');
        break;

      // TODO: Implement keyboard navigation (at upper component?)

      default:
        break;
    }
  };
  const comp = (
    <div
      onKeyDown={handleKeyDown}
      onClick={onClickHandler}
      role="button"
      tabIndex={0}
      className="noteCel {ptn === '-' ? 'noteOff' : 'noteOn'}"
    />
  );
  return comp;
};

export default Note;
