import type { ReactNode } from "react";

export const metadata = {
  title: "제주AX단 길잡이",
  description: "내 일에 맞는 AI 배움의 순서를 알려 주는 제주AX단 길잡이",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "system-ui, 'Malgun Gothic', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
