import { Metadata } from "next";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const username = params.username;
  
  try {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      const data = snap.docs[0].data();
      const displayName = data.displayName || username;
      const bio = data.bio || `${displayName}님의 모든 링크를 한 곳에서 확인해보세요!`;
      
      return {
        title: `${displayName} (@${username})`,
        description: bio,
        openGraph: {
          title: `${displayName} (@${username}) | MyLink`,
          description: bio,
          type: "profile",
          username: username,
        },
        twitter: {
          card: "summary_large_image",
          title: `${displayName} (@${username}) | MyLink`,
          description: bio,
        }
      };
    }
  } catch (error) {
    console.error("Error fetching metadata for user:", error);
  }

  return {
    title: `${username}님의 프로필`,
    description: `${username}님의 프로필 페이지입니다.`,
  };
}

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
