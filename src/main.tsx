import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider, theme, App as AntApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      wave={{ disabled: true }}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#285546",
          colorInfo: "#285546",
          colorSuccess: "#46745c",
          colorWarning: "#9e733d",
          colorLink: "#285546",
          colorLinkHover: "#40745e",
          colorBgBase: "#f7f7f2",
          colorBgContainer: "#fffefa",
          colorBgElevated: "#fffefa",
          colorBorder: "#dce0d5",
          colorBorderSecondary: "#e7e9df",
          colorText: "#283b32",
          colorTextSecondary: "#697367",
          colorTextTertiary: "#788174",
          borderRadius: 8,
          borderRadiusLG: 12,
          fontSize: 14,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
          controlHeight: 38,
        },
        components: {
          Card: { paddingLG: 24, headerFontSize: 16 },
          Segmented: { itemSelectedBg: "#fffefa", itemSelectedColor: "#285546", trackBg: "#eeefe7" },
          Button: { primaryColor: "#fffefa", defaultShadow: "none", primaryShadow: "none" },
          Tabs: { horizontalItemGutter: 28 },
        },
      }}
    >
      <AntApp><App /></AntApp>
    </ConfigProvider>
  </StrictMode>,
);
