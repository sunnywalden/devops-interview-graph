/** A small, offline-friendly illustration for the study desk. */
export function StudyIllustration() {
  return (
    <svg className="study-illustration" viewBox="0 0 320 280" fill="none" aria-hidden="true">
      <defs>
        <pattern id="study-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#b6c9a5" opacity=".25" />
        </pattern>
      </defs>
      <rect width="320" height="280" fill="url(#study-dots)" />
      <circle cx="171" cy="135" r="106" stroke="#b6c9a5" strokeOpacity=".25" />
      <path d="M25 83H64L88 106M248 191L272 211H303" stroke="#b6c9a5" strokeOpacity=".6" />
      <circle cx="88" cy="106" r="3" fill="#bfd0a9" />
      <circle cx="248" cy="191" r="3" fill="#bfd0a9" />
      <g transform="rotate(9 173 139)">
        <rect x="105" y="46" width="154" height="194" rx="18" stroke="#b6c9a5" strokeWidth="1.5" />
      </g>
      <g transform="rotate(-9 165 137)">
        <rect x="83" y="36" width="164" height="203" rx="18" fill="#b7caa7" stroke="#e0e8c9" strokeWidth="3" />
        <rect x="94" y="47" width="142" height="123" rx="10" fill="#244d40" stroke="#7f9e80" strokeWidth="2" />
        <path d="M110 63H220" stroke="#7f9e80" strokeOpacity=".5" />
        <circle cx="112" cy="56" r="2" fill="#c0cfab" />
        <circle cx="120" cy="56" r="2" fill="#c0cfab" />
        <circle cx="128" cy="56" r="2" fill="#c0cfab" />
        <path d="m115 80 9 7-9 7M132 94h24" stroke="#dce6be" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M112 111h91M112 120h60M112 129h81M112 138h47" stroke="#9cbb9b" strokeWidth="3" strokeLinecap="round" />
        <rect x="104" y="182" width="122" height="40" rx="7" fill="#244d40" />
        <rect x="115" y="195" width="18" height="14" rx="3" stroke="#c4d4ae" strokeWidth="1.5" />
        <path d="M134 202h17m30 0h17" stroke="#c4d4ae" strokeWidth="1.5" />
        <rect x="152" y="195" width="28" height="14" rx="3" fill="#86a88c" />
        <circle cx="205" cy="202" r="7" fill="#dca084" />
      </g>
      <path d="M37 240h42m-21-21v42M278 46h18m-9-9v18" stroke="#b6c9a5" strokeOpacity=".5" />
      <text x="17" y="73" fill="#bfd0a9" fontSize="7" fontFamily="monospace" letterSpacing="2">KEEP BUILDING</text>
      <text x="244" y="226" fill="#bfd0a9" fontSize="7" fontFamily="monospace" letterSpacing="2">FIG. 01</text>
    </svg>
  );
}
