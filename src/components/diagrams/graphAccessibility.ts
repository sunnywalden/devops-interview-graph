import { translate, type Locale } from "../../i18n/ui";

/** These diagrams support navigation and zooming, not node/edge editing. */
export function graphAccessibility(locale: Locale) {
  const t = (key: string) => translate(locale, key);
  return {
    "node.a11yDescription.default": t("只读节点。可使用图谱控件缩放或适应画布。"),
    "node.a11yDescription.keyboardDisabled": t("只读节点。可使用图谱控件缩放或适应画布。"),
    "edge.a11yDescription.default": t("只读连线，表示知识点之间的关系。"),
    "controls.ariaLabel": t("图谱控件"),
    "controls.zoomIn.ariaLabel": t("放大图谱"),
    "controls.zoomOut.ariaLabel": t("缩小图谱"),
    "controls.fitView.ariaLabel": t("适应画布"),
    "minimap.ariaLabel": t("图谱缩略图"),
  };
}
