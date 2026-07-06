import { ImageResponse } from 'next/og';

export const alt = 'MyLink - One Link to Rule Them All';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
          backgroundImage: 'linear-gradient(to bottom right, #09090b, #1e1b4b, #312e81)',
          fontFamily: 'sans-serif',
          padding: '80px',
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '40px', 
          background: 'rgba(255,255,255,0.1)', 
          padding: '16px 40px', 
          borderRadius: '50px', 
          border: '2px solid rgba(255,255,255,0.2)' 
        }}>
          <span style={{ fontSize: 32, color: '#e4e4e7', fontWeight: 600 }}>🚀 MyLink is now in Public Beta</span>
        </div>
        <h1 style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontSize: 88, 
          fontWeight: 900, 
          color: 'white', 
          margin: 0, 
          textAlign: 'center', 
          letterSpacing: '-0.03em', 
          lineHeight: 1.1 
        }}>
          <span>One Link to</span>
          <span style={{ color: '#c084fc', marginTop: '10px' }}>Rule Them All.</span>
        </h1>
        <p style={{ 
          fontSize: 36, 
          color: '#a1a1aa', 
          marginTop: '50px', 
          maxWidth: '800px', 
          textAlign: 'center', 
          fontWeight: 500, 
          lineHeight: 1.5 
        }}>
          Google 계정으로 단 3초만에 로그인하고, 나만의 멋진 프로필 페이지를 만들어 세상에 공유하세요.
        </p>
      </div>
    ),
    { ...size }
  );
}
