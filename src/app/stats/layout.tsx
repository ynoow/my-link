import { Metadata } from "next";

export const metadata: Metadata = {
  title: "방문자 통계",
  description: "내 프로필 방문자 통계 요약",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
