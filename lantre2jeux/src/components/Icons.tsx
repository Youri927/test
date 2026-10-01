import React from 'react';

type P = {size?: number; color?: string; style?: React.CSSProperties};

export const Star: React.FC<P & {fill?: number}> = ({size = 40, color = '#F2A23A', fill = 1, style}) => {
  const id = `st${Math.round(fill * 100)}${color.replace('#', '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <defs>
        <linearGradient id={id}>
          <stop offset={fill} stopColor={color} />
          <stop offset={fill} stopColor="rgba(255,255,255,0.18)" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.8l3.1 6.6 7.1.9-5.2 4.9 1.4 7.1L12 17.8l-6.4 3.5 1.4-7.1L1.8 9.3l7.1-.9z"
        fill={`url(#${id})`}
      />
    </svg>
  );
};

export const Users: React.FC<P> = ({size = 48, color = '#000', style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" style={style}>
    <circle cx="9" cy="8" r="3.6" />
    <path d="M2.5 20c.6-3.6 3.2-5.6 6.5-5.6s5.9 2 6.5 5.6" />
    <circle cx="17" cy="9" r="2.8" />
    <path d="M16.5 14.2c2.7.2 4.5 2 5 4.8" />
  </svg>
);

export const Ticket: React.FC<P> = ({size = 48, color = '#000', style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" style={style}>
    <path d="M3 7.5V5h18v2.5a2.5 2.5 0 000 5V15H3v-2.5a2.5 2.5 0 000-5z" transform="translate(0 2)" />
    <path d="M14 7v10" strokeDasharray="2 2.2" />
  </svg>
);

export const Globe: React.FC<P> = ({size = 40, color = '#fff', style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} style={style}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M2.5 12h19M12 2.5c2.8 2.8 3.8 6 3.8 9.5s-1 6.7-3.8 9.5M12 2.5C9.2 5.3 8.2 8.5 8.2 12s1 6.7 3.8 9.5" />
  </svg>
);

export const Pin: React.FC<P> = ({size = 40, color = '#fff', style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} style={style}>
    <path d="M12 22s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const Arrow: React.FC<P> = ({size = 40, color = '#fff', style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const Lock: React.FC<P> = ({size = 40, color = '#fff', style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} style={style}>
    <rect x="4.5" y="10.5" width="15" height="11" rx="2.5" />
    <path d="M8 10.5V7a4 4 0 018 0v3.5" />
  </svg>
);
