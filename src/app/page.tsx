"use client";

import React, { useState, useEffect } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Camera, Video, BookOpen, Code, Briefcase, ArrowRight, LinkIcon, Plus, Pencil, Trash2, LogOut, Settings, ChartBar, MapPin, Loader2, Link as LinkIcon2, Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  order?: number;
}

interface UserProfile {
  displayName: string;
  bio: string;
  photoURL: string;
  username: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Instagram: <Camera className="w-5 h-5" />,
  Youtube: <Video className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Github: <Code className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
};

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineUrl, setInlineUrl] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "links"), orderBy("createdAt", "desc"));
    const unsubLinks = onSnapshot(q, (snapshot) => {
      const fetchedLinks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LinkItem[];
      

      setLinks(fetchedLinks);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching links:", error);
      toast.error("링크 데이터를 불러오는데 실패했습니다. (인덱스 생성 중일 수 있습니다.)");
      setIsLoading(false);
    });

    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        setDisplayName(data.displayName || user.displayName || "");
        setBio(data.bio || "");
        setUsername(data.username || "");
      } else {
        setDisplayName(user.displayName || "");
        setUsername(user.email?.split("@")[0] || "");
      }
    }, (error) => {
      console.error("Error fetching profile:", error);
      setIsLoading(false);
    });

    return () => {
      unsubLinks();
      unsubProfile();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      toast.error("로그인에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "links"), {
        userId: user.uid,
        title,
        url: url.startsWith("http") ? url : `https://${url}`,
        icon: "LinkIcon",
        createdAt: serverTimestamp()
      });
      setIsAddOpen(false);
      setTitle("");
      setUrl("");
      toast.success("링크가 추가되었습니다.");
    } catch (err) {
      toast.error("링크 추가 실패");
    }
  };

  const startInlineEdit = (link: LinkItem) => {
    setInlineEditId(link.id);
    setInlineTitle(link.title);
    setInlineUrl(link.url);
  };

  const handleInlineSave = async (id: string) => {
    try {
      await updateDoc(doc(db, "users", user!.uid, "links", id), {
        title: inlineTitle,
        url: inlineUrl.startsWith("http") ? inlineUrl : `https://${inlineUrl}`,
      });
      setInlineEditId(null);
      toast.success("링크가 수정되었습니다.");
    } catch (err) {
      toast.error("링크 수정 실패");
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "links", id));
      toast.success("링크가 삭제되었습니다.");
    } catch (err) {
      toast.error("링크 삭제 실패");
    }
  };



  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        displayName,
        bio,
        username,
        photoURL: user.photoURL || "",
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsProfileOpen(false);
      toast.success("프로필이 업데이트되었습니다.");
    } catch (err) {
      toast.error("프로필 업데이트 실패");
    }
  };

  const handleCopyLink = () => {
    if (!profile?.username) {
      toast.error("프로필 설정에서 '사용자 아이디'를 먼저 설정해주세요!");
      return;
    }
    const shareUrl = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("내 프로필 링크가 복사되었습니다!");
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-svh bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/30">
      {user ? (
        <>
          {/* Header for Mobile/Desktop */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex items-center gap-2 font-medium bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 backdrop-blur-md border-zinc-200/60 dark:border-zinc-800/60 shadow-sm"
              onClick={() => {
                const urlUsername = profile?.username || (user.email ? user.email.split('@')[0] : "user");
                window.open(`/${urlUsername}`, '_blank');
              }}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              내 페이지 보기
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-200/60 dark:border-zinc-800/60 hover:ring-2 hover:ring-primary/50 transition-all">
                  <Avatar className="w-8 h-8 cursor-pointer">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="font-bold text-zinc-700 dark:text-zinc-300">
                      {profile?.displayName?.charAt(0) || user.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl shadow-xl border-zinc-200/60 dark:border-zinc-800/60 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">
                <DropdownMenuLabel className="flex flex-col gap-1.5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm truncate pr-2 text-zinc-900 dark:text-zinc-100">
                      {profile?.displayName || user.displayName || "User"}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium truncate">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-200/60 dark:bg-zinc-800/60" />
                <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="cursor-pointer py-2.5 focus:bg-zinc-100 dark:focus:bg-zinc-800 rounded-md m-1">
                  <Settings className="w-4 h-4 mr-2" />
                  프로필 편집
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2.5 focus:bg-zinc-100 dark:focus:bg-zinc-800 rounded-md m-1">
                  <Link href="/stats">
                    <ChartBar className="w-4 h-4 mr-2" />
                    통계 대시보드
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-200/60 dark:bg-zinc-800/60" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2.5 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/50 rounded-md m-1">
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Left Column: Fixed Profile Section */}
          <div className="w-full md:w-[350px] lg:w-[420px] md:h-screen md:sticky top-0 bg-white dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-center p-8 md:p-12 relative overflow-hidden z-10 shadow-sm md:shadow-none">
            {/* Subtle decorative background gradient */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-primary/10 to-transparent opacity-50 pointer-events-none -z-10" />

            <div className="space-y-8">
              {/* Avatar Profile */}
              <div className="relative inline-block">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-primary/80 to-primary/20 p-[3px] shadow-lg shadow-primary/20">
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center overflow-hidden border-[3px] border-white dark:border-zinc-950">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl md:text-6xl">🧑‍💻</span>
                    )}
                  </div>
                </div>
                {/* Status indicator */}
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-5 h-5 md:w-6 md:h-6 bg-green-500 border-4 border-white dark:border-zinc-900 rounded-full shadow-sm"></div>
              </div>

              {/* Profile Text */}
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {profile?.displayName || user.displayName || "User"}
                </h1>
                <p className="text-lg text-primary font-medium flex items-center gap-1.5">
                  @{profile?.username || user.email?.split('@')[0]}
                </p>
                <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-xs mt-4">
                  {profile?.bio || "나를 소개하는 한 줄을 작성해보세요."}
                </p>
                
                <div className="pt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>Seoul, South Korea</span>
                  </div>
                  <Button onClick={handleCopyLink} variant="outline" className="gap-2 rounded-full shadow-sm w-full md:w-auto mt-2">
                    <Copy className="w-4 h-4" />
                    내 링크 복사하기
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Scrollable Link List */}
          <div className="flex-1 w-full bg-zinc-50/50 dark:bg-zinc-950/80 relative overflow-y-auto">
            {/* Decorative mesh gradient on the right side */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-3xl mx-auto p-6 md:p-12 lg:p-20 md:py-24 space-y-10 md:space-y-12 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">내 링크</h2>
                  <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-medium">Explore my content, portfolio, and social profiles.</p>
                </div>
                <Button onClick={() => { setIsAddOpen(true); setTitle(""); setUrl(""); }} className="gap-2 shadow-sm rounded-full shrink-0">
                  <Plus className="w-4 h-4" />
                  링크 추가
                </Button>
              </div>

              <div className="flex flex-col gap-4 md:gap-5">
                {links.length === 0 ? (
                  <div className="text-center py-20 text-zinc-500">
                    추가된 링크가 없습니다.
                  </div>
                ) : (
                  links.map((link) => (
                    <div key={link.id} className="group relative block outline-none rounded-2xl">
                      <Card className="relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 border-zinc-200/60 dark:border-zinc-800/60 group-hover:border-primary/40 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl">
                        {/* Hover background gradient effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%] ease-in-out pointer-events-none" />
                        
                        <CardContent className="p-4 md:p-6 flex items-center justify-between relative z-10 w-full">
                          {inlineEditId === link.id ? (
                            <div className="flex-1 flex flex-col gap-3 w-full">
                              <div className="flex flex-col gap-2 w-full">
                                <Input 
                                  value={inlineTitle} 
                                  onChange={(e) => setInlineTitle(e.target.value)} 
                                  className="h-9 w-full bg-white/60 dark:bg-zinc-900/60 font-semibold" 
                                  placeholder="링크 제목"
                                  autoFocus
                                />
                                <Input 
                                  value={inlineUrl} 
                                  onChange={(e) => setInlineUrl(e.target.value)} 
                                  className="h-8 w-full text-xs text-zinc-500 bg-white/60 dark:bg-zinc-900/60" 
                                  placeholder="https://..."
                                />
                              </div>
                              <div className="flex items-center justify-end gap-2 w-full">
                                <Button size="sm" variant="ghost" onClick={() => setInlineEditId(null)} className="h-8 text-xs">취소</Button>
                                <Button size="sm" onClick={() => handleInlineSave(link.id)} className="h-8 text-xs">저장</Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Link href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center gap-4 md:gap-6 z-10 min-w-0">
                                <div className="flex shrink-0 items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                                  {link.icon && iconMap[link.icon] ? iconMap[link.icon] : <LinkIcon2 className="w-5 h-5" />}
                                </div>
                                <span className="font-semibold text-base md:text-lg text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">
                                  {link.title}
                                </span>
                              </Link>

                              {/* Edit/Delete Buttons & Arrow */}
                              <div className="flex items-center gap-2 z-20 shrink-0 ml-4">
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-2">
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); startInlineEdit(link); }} className="h-9 w-9 text-zinc-500 hover:text-primary hover:bg-primary/10">
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); handleDeleteLink(link.id); }} className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                {/* The beautiful right arrow */}
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300 pointer-events-none">
                                  <ArrowRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50/50 dark:bg-zinc-950/80 min-h-[calc(100vh)]">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <LinkIcon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">나만의 링크트리를 만들어보세요</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md text-lg">
            Google 계정으로 로그인하여 여러 개의 링크를 한 곳에 모아 공유할 수 있는 페이지를 쉽게 만들어보세요.
          </p>
          <Button size="lg" onClick={handleLogin} className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
            Google 계정으로 시작하기
          </Button>
        </div>
      )}

      {/* Add Link Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>새 링크 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLink} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>제목 (Title)</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="예: 내 블로그" />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={url} onChange={e => setUrl(e.target.value)} required placeholder="예: https://example.com" />
            </div>
            <Button type="submit" className="w-full">추가하기</Button>
          </form>
        </DialogContent>
      </Dialog>



      {/* Profile Edit Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>이름 (표시명)</Label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>사용자 아이디 (고유 주소용)</Label>
              <Input value={username} onChange={e => setUsername(e.target.value)} required placeholder="영문/숫자" />
            </div>
            <div className="space-y-2">
              <Label>소개글</Label>
              <Input value={bio} onChange={e => setBio(e.target.value)} placeholder="나를 표현하는 한 줄" />
            </div>
            <Button type="submit" className="w-full">프로필 저장</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
