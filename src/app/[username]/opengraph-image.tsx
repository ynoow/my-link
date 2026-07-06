import { ImageResponse } from 'next/og';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const alt = 'MyLink Profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
          fontFamily: 'sans-serif',
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
          padding: '60px 80px', 
          borderRadius: '40px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', 
          border: '2px solid rgba(226,232,240,0.8)', 
          zIndex: 10,
          maxWidth: '80%'
        }}>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              style={{ width: 180, height: 180, borderRadius: 90, border: '8px solid white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 180, height: 180, borderRadius: 90, background: 'linear-gradient(to top right, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 72, fontWeight: 'bold', border: '8px solid white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 style={{ fontSize: 64, fontWeight: 900, color: '#0f172a', marginTop: '40px', marginBottom: '12px', textAlign: 'center' }}>
            {user.displayName}
          </h1>
          <p style={{ fontSize: 32, color: '#64748b', margin: 0, fontWeight: 500 }}>
            @{params.username}
          </p>
          <div style={{ display: 'flex', width: '60px', height: '6px', background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', borderRadius: '3px', marginTop: '30px', marginBottom: '30px' }} />
          <p style={{ fontSize: 36, color: '#334155', margin: 0, maxWidth: '700px', textAlign: 'center', fontWeight: 600, lineHeight: 1.5 }}>
            {user.bio}
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
