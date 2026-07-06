"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy, updateDoc, doc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound, useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Camera, Video, BookOpen, Code, Briefcase, MapPin, LinkIcon, AlertCircle } from "lucide-react";
import { LinkItem } from "@/data/links";

const iconMap: Record<string, React.ReactNode> = {
  Instagram: <Camera className="w-5 h-5" />,
  Youtube: <Video className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Github: <Code className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
};

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: async () => {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        throw new Error("UserNotFound");
      }
      
      const userDoc = snap.docs[0];
      const data = { id: userDoc.id, ...userDoc.data() } as any;

      return data;
    },
    retry: false
  });

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ['publicLinks', userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];
      const q = query(collection(db, 'users', userData.id, 'links'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LinkItem[];
    },
    enabled: !!userData?.id,
  });

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userError) {
    if (userError.message === "UserNotFound") {
      notFound();
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">오류가 발생했습니다</h2>
          <p className="text-zinc-500">{userError.message}</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-primary/20 selection:text-primary flex justify-center pb-20">
      <div className="w-full max-w-2xl px-4 md:px-8 py-12 md:py-20 flex flex-col items-center">
        
        {/* Profile Section */}
        <div className="w-full flex flex-col items-center text-center space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative inline-block">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-primary/80 to-primary/20 p-[3px] shadow-lg shadow-primary/20">
              <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center overflow-hidden border-[3px] border-white dark:border-zinc-950">
                {userData.photoURL ? (
                  <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl md:text-6xl">🧑‍💻</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {userData.displayName || "User"}
            </h1>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              @{userData.username}
            </p>
            {userData.bio && (
              <p className="text-base text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed max-w-md mx-auto whitespace-pre-wrap pt-2">
                {userData.bio}
              </p>
            )}
          </div>
        </div>

        {/* Links Section */}
        <div className="w-full space-y-4">
          {isLinksLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : links.length > 0 ? (
            <div className="space-y-4 w-full">
              {links.map((link, index) => (
                <div 
                  key={link.id} 
                  className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group"
                    onClick={() => {
                      if (userData?.id && link.id) {
                        updateDoc(doc(db, "users", userData.id, "links", link.id), {
                          clicks: increment(1)
                        }).catch(console.error);
                      }
                    }}
                  >
                    <Card className="relative overflow-hidden border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30">
                      <CardContent className="p-4 md:p-6 flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                          {iconMap[link.icon || "LinkIcon"] || <LinkIcon className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base md:text-lg text-zinc-900 dark:text-zinc-100 truncate group-hover:text-primary transition-colors">
                            {link.title}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">아직 등록된 링크가 없어요!</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
