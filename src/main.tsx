import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider, theme, App as AntApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import "./index.css";
import App from "./App";

/** Night Briefing — amber accent dark theme tokens. */
const AMBER = "#E6A23C";
const AMBER_HOVER = "#F0B24F";
const AMBER_ACTIVE = "#C88A2A";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: AMBER,
          colorInfo: AMBER,
          colorSuccess: "#3DB88A",
          colorWarning: "#D4A017",
          colorLink: AMBER,
          colorLinkHover: AMBER_HOVER,
          colorLinkActive: AMBER_ACTIVE,
          colorBgBase: "#0B0F14",
          colorBgContainer: "#161E29",
          colorBgElevated: "#121821",
          colorBorder: "rgba(255,255,255,0.12)",
          colorBorderSecondary: "rgba(255,255,255,0.06)",
          colorText: "#E8EEF4",
          colorTextSecondary: "#8B9BB0",
          colorTextTertiary: "#667788",
          borderRadius: 10,
          borderRadiusLG: 12,
          fontSize: 15,
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
          controlHeight: 36,
        },
        components: {
          Layout: {
            headerBg: "#121821",
            bodyBg: "#0B0F14",
            footerBg: "#0B0F14",
          },
          Card: {
            colorBgContainer: "#161E29",
            paddingLG: 20,
          },
          Menu: {
            darkItemBg: "transparent",
            darkItemSelectedBg: "rgba(230, 162, 60, 0.22)",
            darkItemHoverBg: "rgba(230, 162, 60, 0.12)",
          },
          Segmented: {
            itemSelectedBg: "rgba(230, 162, 60, 0.28)",
            itemSelectedColor: "#E8EEF4",
            trackBg: "#0B0F14",
          },
          Collapse: {
            headerBg: "transparent",
            contentBg: "transparent",
          },
          Button: {
            primaryColor: "#0B0F14",
          },
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
