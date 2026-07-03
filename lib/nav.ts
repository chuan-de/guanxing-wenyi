// 工作台导航项 —— 桌面左侧栏 / 移动底部标签栏共用
export interface NavItem {
  key: string;
  href: string;
  label: string;
  // 移动端底部标签栏只展示前 5 项（mobile=true）
  mobile?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/app", label: "今日", mobile: true },
  { key: "ask", href: "/app/ask", label: "问卦", mobile: true },
  { key: "chat", href: "/app/chat", label: "小易", mobile: true },
  { key: "journal", href: "/app/journal", label: "心境", mobile: true },
  { key: "love", href: "/app/love", label: "姻缘", mobile: true },
  { key: "report", href: "/app/report", label: "深度报告" },
];

export const SECONDARY_NAV: NavItem[] = [
  { key: "system", href: "/app/system", label: "设计系统" },
];
