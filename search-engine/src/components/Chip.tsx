import type { JSX } from "react";

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  accent: string;
  surface2: string;
  textMuted: string;
  border: string;
}

export function Chip({
  label,
  active,
  onClick,
  accent,
  surface2,
  textMuted,
  border,
}: ChipProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="transition-all duration-200 cursor-pointer select-none"
      style={{
        padding: "6px 14px",
        borderRadius: 20,
        fontSize: 12.5,
        fontWeight: active ? 600 : 400,
        background: active ? `${accent}18` : surface2,
        color: active ? accent : textMuted,
        border: `1px solid ${active ? `${accent}44` : border}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
