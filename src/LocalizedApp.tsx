import { useEffect } from "react";
import { ConfigProvider, theme, App as AntApp } from "antd";
import enUS from "antd/locale/en_US";
import { useLocale } from "./i18n/useLocale";
import zhCN from "antd/locale/zh_CN";
import App from "./App";

export function LocalizedApp() {
  const { locale } = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.title = locale === "zh" ? "DevOps 面试研习室" : "DevOps Interview Studio";
  }, [locale]);
  return (
    <ConfigProvider
      locale={locale === "zh" ? zhCN : enUS}
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
  );
}
