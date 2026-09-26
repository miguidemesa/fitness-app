import React from "react";

/** A plain phone frame. Content scrolls inside at 1:1, sized for a 1080×1920 video. */
export const Phone: React.FC<{
  children: React.ReactNode;
  width?: number;
  height?: number;
}> = ({ children, width = 760, height = 1360 }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 84,
      background: "#121212",
      padding: 16,
      boxSizing: "border-box",
      boxShadow: "0 40px 90px rgba(18,18,18,0.35)",
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 68,
        background: "#F5F5F2",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: "70px 40px",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  </div>
);
