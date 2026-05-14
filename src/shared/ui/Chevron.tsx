import { MdChevronRight } from 'react-icons/md';

export function Chevron({ open, size = 18 }: { open: boolean; size?: number }) {
  return (
    <MdChevronRight
      size={size}
      className={`text-muted transition-transform duration-200 ${open ? 'rotate-90' : 'rotate-0'}`}
      aria-hidden="true"
    />
  );
}
