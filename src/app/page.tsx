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
import { Camera, Video, BookOpen, Code, Briefcase, ArrowRight, LinkIcon, Plus, Pencil, Trash2, LogOut, Settings, ChartBar, MapPin, Loader2, Link as LinkIcon2, Copy, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  order?: number;
  clicks?: number;
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

  const [isUsernameEditing, setIsUsernameEditing] = useState(false);
  const [isBioEditing, setIsBioEditing] = useState(false);
  const [inlineTitleError, setInlineTitleError] = useState("");
  const [inlineUrlError, setInlineUrlError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");

  const validateUrl = (u: string) => /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(u);

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
    
    let hasError = false;
    if (!title.trim()) {
      setTitleError("링크 이름을 입력해주세요.");
      hasError = true;
    } else {
      setTitleError("");
    }
    
    if (!url.trim() || !validateUrl(url)) {
      setUrlError("유효한 URL을 입력해주세요.");
      hasError = true;
    } else {
      setUrlError("");
    }
    
    if (hasError) return;

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
      setTitleError("");
      setUrlError("");
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
    let hasError = false;
    if (!inlineTitle.trim()) {
      setInlineTitleError("링크 이름을 입력해주세요.");
      hasError = true;
    } else {
      setInlineTitleError("");
    }
    
    if (!inlineUrl.trim() || !validateUrl(inlineUrl)) {
      setInlineUrlError("유효한 URL을 입력해주세요.");
      hasError = true;
    } else {
      setInlineUrlError("");
    }
    
    if (hasError) return;

    try {
      await updateDoc(doc(db, "users", user!.uid, "links", id), {
        title: inlineTitle,
        url: inlineUrl.startsWith("http") ? inlineUrl : `https://${inlineUrl}`,
      });
      setInlineEditId(null);
      setInlineTitleError("");
      setInlineUrlError("");
      toast.success("링크가 수정되었습니다.");
    } catch (err) {
      toast.error("링크 수정 실패");
    }
  };

  const executeDeleteLink = async () => {
    if (!linkToDelete) return;
    try {
      await deleteDoc(doc(db, "users", user!.uid, "links", linkToDelete));
      toast.success("링크가 삭제되었습니다.");
    } catch (err) {
      toast.error("링크 삭제 실패");
    }
    setLinkToDelete(null);
  };



  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        displayName: profile?.displayName || user.displayName || "User", // displayName is no longer updatable by user
        bio,
        username,
        photoURL: user.photoURL || "",
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsProfileOpen(false);
      setIsUsernameEditing(false);
      setIsBioEditing(false);
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
              <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/60 hover:ring-2 hover:ring-primary/50 transition-all outline-none cursor-pointer">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="font-bold text-zinc-700 dark:text-zinc-300">
                    {profile?.displayName?.charAt(0) || user.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl shadow-xl border-zinc-200/60 dark:border-zinc-800/60 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">
                <div className="flex flex-col gap-1.5 p-3 px-2 py-2 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm truncate pr-2 text-zinc-900 dark:text-zinc-100">
                      {profile?.displayName || user.displayName || "User"}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium truncate">
                    {user.email}
                  </span>
                </div>
                <DropdownMenuSeparator className="bg-zinc-200/60 dark:bg-zinc-800/60" />
                <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="cursor-pointer py-2.5 focus:bg-zinc-100 dark:focus:bg-zinc-800 rounded-md m-1">
                  <Settings className="w-4 h-4 mr-2" />
                  프로필 편집
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/stats"} className="cursor-pointer py-2.5 focus:bg-zinc-100 dark:focus:bg-zinc-800 rounded-md m-1">
                  <ChartBar className="w-4 h-4 mr-2" />
                  통계 대시보드
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
          <div className="w-full md:w-[350px] lg:w-[420px] md:h-screen md:sticky top-0 bg-white dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-center p-8 md:p-12 relative overflow-y-auto z-10 shadow-sm md:shadow-none">
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
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 pr-8">
                  {profile?.displayName || user.displayName || "User"}
                </h1>
                
                {/* Username */}
                <div className="group relative">
                  {isUsernameEditing ? (
                    <div className="flex flex-col gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
                      <Label className="text-xs font-semibold text-zinc-500">아이디 (@)</Label>
                      <Input value={username} onChange={(e) => setUsername(e.target.value)} className="h-8 text-primary font-medium bg-white dark:bg-zinc-900" />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsUsernameEditing(false)} className="h-7 text-xs">취소</Button>
                        <Button size="sm" onClick={handleUpdateProfile} className="h-7 text-xs">저장</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-primary font-medium flex items-center gap-1.5">
                        @{profile?.username || user.email?.split('@')[0]}
                      </p>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setUsername(profile?.username || user.email?.split('@')[0] || "");
                        setIsUsernameEditing(true);
                        setIsBioEditing(false);
                      }} className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="group relative">
                  {isBioEditing ? (
                    <div className="flex flex-col gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700/50 mt-2">
                      <Label className="text-xs font-semibold text-zinc-500">소개글</Label>
                      <Input value={bio} onChange={(e) => setBio(e.target.value)} className="h-8 bg-white dark:bg-zinc-900" />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsBioEditing(false)} className="h-7 text-xs">취소</Button>
                        <Button size="sm" onClick={handleUpdateProfile} className="h-7 text-xs">저장</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-xs">
                        {profile?.bio || "나를 소개하는 한 줄을 작성해보세요."}
                      </p>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setBio(profile?.bio || "");
                        setIsBioEditing(true);
                        setIsUsernameEditing(false);
                      }} className="w-6 h-6 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 flex flex-col gap-3 w-full">
                  <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>Seoul, South Korea</span>
                  </div>
                  <Button onClick={handleCopyLink} variant="outline" className="gap-2 rounded-xl shadow-sm w-full mt-2">
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
                                  onChange={(e) => { setInlineTitle(e.target.value); setInlineTitleError(""); }} 
                                  className={`h-9 w-full bg-white/60 dark:bg-zinc-900/60 font-semibold ${inlineTitleError ? 'border-red-500' : ''}`} 
                                  placeholder="링크 제목"
                                  autoFocus
                                />
                                {inlineTitleError && <span className="text-xs text-red-500 mt-1">{inlineTitleError}</span>}
                                
                                <Input 
                                  value={inlineUrl} 
                                  onChange={(e) => { setInlineUrl(e.target.value); setInlineUrlError(""); }} 
                                  className={`h-8 w-full text-xs text-zinc-500 bg-white/60 dark:bg-zinc-900/60 ${inlineUrlError ? 'border-red-500' : ''}`} 
                                  placeholder="https://..."
                                />
                                {inlineUrlError && <span className="text-xs text-red-500 mt-1">{inlineUrlError}</span>}
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
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="font-semibold text-base md:text-lg text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">
                                    {link.title}
                                  </span>
                                  <span className="text-xs text-zinc-400 font-medium flex items-center gap-1 mt-1">
                                    <ChartBar className="w-3.5 h-3.5" />
                                    클릭 {link.clicks?.toLocaleString() || 0}회
                                  </span>
                                </div>
                              </Link>

                              {/* Edit/Delete Buttons & Arrow */}
                              <div className="flex items-center gap-2 z-20 shrink-0 ml-4">
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-2">
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); startInlineEdit(link); }} className="h-9 w-9 text-zinc-500 hover:text-primary hover:bg-primary/10">
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); setLinkToDelete(link.id); }} className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50">
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
        <div className="w-full flex flex-col md:flex-row items-center justify-center p-8 md:p-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 min-h-[calc(100vh)] gap-12 overflow-hidden relative">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse duration-1000"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse duration-700"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse duration-500"></div>

          {/* Text Content */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 mb-8 transition-transform hover:scale-105">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">MyLink is now in Public Beta</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-6 leading-tight">
              One Link to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">Rule Them All.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-10 max-w-lg font-medium leading-relaxed">
              Google 계정으로 단 3초만에 로그인하고, 나만의 멋진 프로필 페이지를 만들어 세상에 공유하세요.
            </p>
            
            <Button size="lg" onClick={handleLogin} className="group relative text-lg px-8 py-7 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-2">
                Google 계정으로 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>

          {/* Visual Mockup Content */}
          <div className="flex-1 w-full max-w-md relative z-10 mt-12 md:mt-0 perspective-1000">
            <div className="relative rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-2xl border-[12px] border-zinc-100 dark:border-zinc-800 p-6 transform md:rotate-[-5deg] hover:rotate-0 transition-transform duration-700 overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-6 bg-zinc-100 dark:bg-zinc-800 flex justify-center">
                <div className="w-20 h-4 bg-white dark:bg-zinc-900 rounded-b-xl"></div>
              </div>
              <div className="flex flex-col items-center mt-8 space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-1 shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center text-4xl">🚀</div>
                </div>
                <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2"></div>
                <div className="h-4 w-48 bg-zinc-100 dark:bg-zinc-800/50 rounded-full mb-6"></div>
                
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full h-14 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex items-center px-4 gap-3 shadow-sm hover:scale-105 hover:shadow-md transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
              <Input value={title} onChange={e => { setTitle(e.target.value); setTitleError(""); }} placeholder="예: 내 블로그" className={titleError ? "border-red-500" : ""} />
              {titleError && <p className="text-xs text-red-500">{titleError}</p>}
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={url} onChange={e => { setUrl(e.target.value); setUrlError(""); }} placeholder="예: https://example.com" className={urlError ? "border-red-500" : ""} />
              {urlError && <p className="text-xs text-red-500">{urlError}</p>}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!linkToDelete} onOpenChange={(open) => !open && setLinkToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>링크 삭제</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-500 text-sm">정말 이 링크를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setLinkToDelete(null)}>취소</Button>
            <Button variant="destructive" onClick={executeDeleteLink}>삭제</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
