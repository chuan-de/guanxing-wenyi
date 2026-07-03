import * as React from "react";

type P = React.SVGProps<SVGSVGElement>;

export const IconToday = (p: P) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...p}>
    <path
      d="M12 3l1.4 7.2L21 12l-7.6 1.8L12 21l-1.4-7.2L3 12l7.6-1.8z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconAsk = (p: P) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...p}>
    <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="5" y1="7" x2="19" y2="7" />
      <line x1="5" y1="12" x2="9.5" y2="12" />
      <line x1="14.5" y1="12" x2="19" y2="12" />
      <line x1="5" y1="17" x2="19" y2="17" />
    </g>
  </svg>
);

export const IconJournal = (p: P) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...p}>
    <path
      d="M16.5 4.2A8 8 0 1 0 20 13a6.6 6.6 0 0 1-3.5-8.8z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconLove = (p: P) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...p}>
    <circle cx="9.5" cy="12" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="14.5" cy="12" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const IconReport = (p: P) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <line x1="8.5" y1="8" x2="15.5" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="8.5" y1="16" x2="12.5" y2="16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const IconSystem = (p: P) => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <rect x="13" y="4" width="7" height="7" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <rect x="4" y="13" width="7" height="7" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <rect x="13" y="13" width="7" height="7" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const IconMic = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconSend = (p: P) => (
  <svg width="18" height="18" viewBox="0 0 20 20" {...p}>
    <path d="M3 10l14-6-6 14-2-6z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const IconBack = (p: P) => (
  <svg width="8" height="14" viewBox="0 0 8 14" {...p}>
    <path d="M7 1L1 7l6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconInfo = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 15 15" {...p}>
    <circle cx="7.5" cy="7.5" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.1" />
    <path d="M7.5 4.4v3.6M7.5 10.4v.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg width="20" height="20" viewBox="0 0 22 22" {...p}>
    <circle cx="11" cy="11" r="9.3" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" />
    <path d="M7 11.2l2.6 2.6L15 8.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconArrowRight = (p: P) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconLogo = (p: P) => (
  <svg width="26" height="26" viewBox="0 0 32 32" {...p}>
    <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="0.5 6" opacity="0.6" />
    <path d="M21 9a8 8 0 1 0 3 8 6.5 6.5 0 0 1-3-8z" fill="currentColor" />
    <circle cx="23" cy="10" r="1.4" fill="#B08E54" />
  </svg>
);
