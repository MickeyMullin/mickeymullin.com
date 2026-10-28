// The MM brand mark. Fills use SVG presentation attributes instead of inline
// style attributes, so the CSP needs no 'unsafe-inline' for styles.
// Source: public/images/brand/mm-logo-*.svg. The simplified mark (no inner wedge,
// solid plug) is for favicons and other small sizes only.

export function Logo() {
  return (
    <svg
      className="mark-logo"
      viewBox="66 0 1188 1254"
      aria-hidden="true"
      focusable="false"
      fillRule="evenodd"
      clipRule="evenodd"
    >
      <g transform="matrix(1.113924,0,0,1.113924,-61.43038,-57.64557)">
        <g data-id="rj45-contacts">
            <rect data-id="rj45-contact-4" x="1121.5" y="1054.5" width="15" height="73.5" fill="currentColor" />
            <rect data-id="rj45-contact-3" x="1091.5" y="1054.5" width="15" height="73.5" fill="currentColor" />
            <rect data-id="rj45-contact-2" x="1061.5" y="1054.5" width="15" height="73.5" fill="currentColor" />
            <rect data-id="rj45-contact-1" x="1031.5" y="1054.5" width="15" height="73.5" fill="currentColor" />
        </g>
        <path data-id="m-left-leg" d="M114.5,497.909L118,501.5L576.966,956.08L511.193,1021.58L215.5,732L215.5,1177.5L114.5,1177.5L114.5,497.909Z" fill="currentColor" fillRule="nonzero" />
        <path data-id="m-main-and-rj45-shell" d="M115.5,273L618,778L1136.5,273L1136.5,941L1156.5,941L1156.5,994L1180,994L1180,1161.5C1180,1172.167 1174.667,1177.5 1164,1177.5L1006,1177.5C995.333,1177.5 990,1172.167 990,1161.5L990,994L1013,994L1013,941L1035.5,941L1035.5,501.5L618.023,915.284L115.5,403.5L115.5,273ZM1066,973L1066,1013L1103,1013L1103,973L1066,973ZM1017,1035L1017,1148L1152,1148L1152,1035L1017,1035Z" fill="currentColor" />
        <g data-id="Signal" transform="matrix(1.034956,0,0,1.034956,-22.754157,-23.543071)">
            <path data-id="wifi-center" d="M450,502.5C554,421 690,421 797,502.5L619,673.5L450,502.5Z" fill="currentColor" fillRule="nonzero" />
            <path data-id="wifi-inner-arc" d="M314,373C495,221 742,221 935.5,373L871.5,434C718,314 529,314 375,434L314,373Z" fill="currentColor" fillRule="nonzero" />
            <path data-id="wifi-outer-arc" d="M180.5,240C438,17 802,17 1070,240L1008.5,299C774,111 482,111 240,299L180.5,240Z" fill="currentColor" fillRule="nonzero" />
        </g>
    </g>
    </svg>
  )
}
