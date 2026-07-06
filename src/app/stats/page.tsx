"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  ArrowLeft, BarChart2, MousePointerClick, Loader2, TrendingUp, 
  Sparkles, LinkIcon, Copy, Settings, QrCode, LogOut 
} from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  clicks: {
    label: "클릭 수",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function StatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        router.push("/");
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  const { data: userData } = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const userDocSnap = await getDoc(doc(db, 'users', user.uid));
      return userDocSnap.exists() ? userDocSnap.data() : null;
    },
    enabled: !!user,
  });

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ['links', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(collection(db, 'users', user.uid, 'links'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          clicks: data.clicks || 0,
        };
      });
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isLoading = authLoading || isLinksLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const totalClicks = links.reduce((acc, link) => acc + link.clicks, 0);

  const chartData = links
    .map(link => ({
      name: link.title || "제목 없음",
      clicks: link.clicks,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return (
    <div className="flex flex-col min-h-svh bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/30">
      
      {/* Shared Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => router.push('/')}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">L</div>
            <span className="font-bold text-lg hidden sm:inline-block text-zinc-900 dark:text-zinc-100">MyLink</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex items-center gap-2 font-medium bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => {
                  const username = userData?.username || (user.email ? user.email.split('@')[0] : "user");
                  window.open(`/${username}`, '_blank');
                }}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                내 페이지 보기
              </Button>
              <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800 hover:ring-2 hover:ring-primary/50 transition-all">
                  <AvatarImage src={user.photoURL || undefined} alt="Profile" />
                  <AvatarFallback className="font-bold text-zinc-700">{user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl shadow-xl border-zinc-200/60 dark:border-zinc-800/60 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">
                <DropdownMenuLabel className="flex flex-col gap-1.5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm truncate pr-2 text-zinc-900 dark:text-zinc-100">{userData?.displayName || user.displayName || "User"}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const username = userData?.username || (user.email ? user.email.split('@')[0] : "user");
                        navigator.clipboard.writeText(`${window.location.origin}/${username}`);
                        toast.success("링크 주소 복사 완료!", {
                          description: "이제 원하는 곳에 붙여넣기하여 공유해 보세요.",
                        });
                      }}
                      className="text-zinc-400 hover:text-primary transition-colors p-1.5 rounded-md hover:bg-primary/10"
                      title="내 링크 복사"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate">@{userData?.username || (user.email ? user.email.split('@')[0] : "user")}</span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-200/60 dark:bg-zinc-800/60" />
                <DropdownMenuItem 
                  className="cursor-pointer py-2.5 focus:bg-zinc-100 dark:focus:bg-zinc-800"
                  onClick={() => {
                    const username = userData?.username || (user.email ? user.email.split('@')[0] : "user");
                    window.open(`/${username}`, '_blank');
                  }}
                >
                  <LinkIcon className="mr-3 h-4 w-4 text-zinc-500" />
                  <span className="font-medium text-sm">내 퍼블릭 페이지 보기</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer py-2.5 focus:bg-zinc-100 dark:focus:bg-zinc-800"
                  onClick={() => router.push('/stats')}
                >
                  <BarChart2 className="mr-3 h-4 w-4 text-zinc-500" />
                  <span className="font-medium text-sm">방문자 통계</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2.5 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                  <Settings className="mr-3 h-4 w-4 text-zinc-500" />
                  <span className="font-medium text-sm">프로필 및 테마 설정</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2.5 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                  <QrCode className="mr-3 h-4 w-4 text-zinc-500" />
                  <span className="font-medium text-sm">QR 코드 발급</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-200/60 dark:bg-zinc-800/60" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2.5 text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/30">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-semibold text-sm">로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Stats Content */}
      <div className="flex-1 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        {/* Decorative background effects */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent opacity-50 blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-blue-500/10 via-primary/5 to-transparent opacity-40 blur-3xl pointer-events-none -z-10 rounded-full" />
        
        <div className="max-w-5xl mx-auto space-y-10 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
            <div className="flex items-center space-x-5">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => router.push('/')} 
                className="rounded-2xl h-12 w-12 bg-white/60 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-800 border-zinc-200/60 dark:border-zinc-800/60 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-x-1 group"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-500">
                    인사이트 요약
                  </h1>
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">링크가 어떻게 성장하고 있는지 확인해보세요.</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold text-sm border border-primary/20 shadow-inner">
              <TrendingUp className="w-4 h-4" />
              실시간 데이터 연동 중
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Card 1 */}
            <Card className="relative overflow-hidden group border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-3xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <BarChart2 className="w-24 h-24 text-primary" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  총 등록 링크
                </CardTitle>
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <BarChart2 className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-4">
                <div className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                  {links.length}<span className="text-xl font-semibold text-zinc-400 ml-1">개</span>
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  당신의 공간에 등록된 전체 링크 수
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="relative overflow-hidden group border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-3xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <MousePointerClick className="w-24 h-24 text-violet-500" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  누적 도달 수
                </CardTitle>
                <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 shadow-inner">
                  <MousePointerClick className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-4">
                <div className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                  {totalClicks.toLocaleString()}<span className="text-xl font-semibold text-zinc-400 ml-1">회</span>
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  모든 방문자들이 남긴 발자취
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <Card className="border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-lg rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-violet-500 to-blue-500" />
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                링크 퍼포먼스 분석
              </CardTitle>
              <CardDescription className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                어떤 링크가 가장 많은 관심을 받았는지 비교해보세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-0">
              {chartData.length > 0 ? (
                <div className="p-4 bg-white/50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-inner">
                  <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
                    <BarChart 
                      accessibilityLayer 
                      data={chartData} 
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      onMouseMove={(state: any) => {
                        if (state.isTooltipActive) {
                          setActiveIndex(state.activeTooltipIndex);
                        } else {
                          setActiveIndex(null);
                        }
                      }}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.4} />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={15}
                        axisLine={false}
                        tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + "..." : value}
                        fontSize={12}
                        fontWeight={500}
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tickMargin={15}
                        fontSize={12}
                        fontWeight={500}
                      />
                      <ChartTooltip
                        cursor={{ fill: 'var(--color-clicks)', opacity: 0.1 }}
                        content={<ChartTooltipContent hideLabel={false} className="shadow-2xl rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md" />}
                      />
                      <Bar
                        dataKey="clicks"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={60}
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={activeIndex === index ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.6)"} 
                            className="transition-all duration-300"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <BarChart2 className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium">표시할 데이터가 없습니다.</p>
                  <p className="text-sm mt-1">링크를 추가하여 첫 방문자를 맞이해보세요!</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}