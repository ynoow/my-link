import { ImageResponse } from 'next/og';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const alt = 'MyLink Profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Image({ params }: { params: { username: string } }) {
  let user = {
    displayName: params.username,
    bio: "내 링크를 확인해보세요!",
    photoURL: "",
  };

  try {
    const q = query(collection(db, 'users'), where('username', '==', params.username));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data();
      user.displayName = data.displayName || params.username;
      user.bio = data.bio || user.bio;
      user.photoURL = data.photoURL || "";
    }
  } catch (error) {
    console.error("Error fetching user for OG:", error);
  }

  const displayBio = user.bio.length > 80 ? user.bio.substring(0, 80) + '...' : user.bio;
  
  // Use local font to guarantee it loads and prevent 404/500 errors
  const fontData = await fetch(new URL('../fonts/malgun.ttf', import.meta.url)).then(res => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(to bottom right, #f8fafc, #e0e7ff)',
          fontFamily: '"SUIT"',
          position: 'relative',
        }}
      >
        {/* Top-left decorative circle */}
        <div style={{ display: 'flex', position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: 200, background: 'rgba(99, 102, 241, 0.15)' }} />
        {/* Bottom-right decorative circle */}
        <div style={{ display: 'flex', position: 'absolute', bottom: -100, right: -100, width: 500, height: 500, borderRadius: 250, background: 'rgba(168, 85, 247, 0.15)' }} />
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'white', 
          padding: '48px 64px', 
          borderRadius: '32px', 
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)', 
          border: '2px solid rgba(226,232,240,0.8)', 
          zIndex: 10,
          maxWidth: '85%',
        }}>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              style={{ width: 140, height: 140, borderRadius: 70, border: '6px solid white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 140, height: 140, borderRadius: 70, background: 'linear-gradient(to top right, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 56, border: '6px solid white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 style={{ fontSize: 52, color: '#0f172a', marginTop: '24px', marginBottom: '8px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '800px' }}>
            {user.displayName}
          </h1>
          <p style={{ fontSize: 28, color: '#64748b', margin: 0 }}>
            @{params.username}
          </p>
          <div style={{ display: 'flex', width: '40px', height: '6px', background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', borderRadius: '3px', marginTop: '20px', marginBottom: '20px' }} />
          <p style={{ display: 'flex', fontSize: 30, color: '#334155', margin: 0, maxWidth: '800px', textAlign: 'center', lineHeight: 1.4 }}>
            {displayBio}
          </p>
        </div>
      </div>
    ),
    { 
      ...size,
      fonts: [
        {
          name: 'SUIT',
          data: fontData,
          style: 'normal',
        }
      ]
    }
  );
}
