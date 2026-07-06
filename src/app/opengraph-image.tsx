import { ImageResponse } from 'next/og';

export const alt = 'MyLink - One Link to Rule Them All';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Image() {
  // Fetch SUIT font for Korean support in Satori
  const fontData = await fetch('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/ttf/SUIT-Bold.ttf').then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundImage: 'linear-gradient(to bottom right, #eef2ff, #faf5ff)',
          fontFamily: '"SUIT"',
          padding: '60px 80px',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Background Elements */}
        <div style={{ display: 'flex', position: 'absolute', top: -100, left: -50, width: 600, height: 600, borderRadius: 300, background: 'rgba(96, 165, 250, 0.15)' }} />
        <div style={{ display: 'flex', position: 'absolute', top: -50, right: -50, width: 500, height: 500, borderRadius: 250, background: 'rgba(192, 132, 252, 0.15)' }} />
        
        {/* Text Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '640px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '24px', 
            background: 'white', 
            padding: '10px 20px', 
            borderRadius: '50px', 
            border: '2px solid #e4e4e7',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: '#22c55e', marginRight: 10 }} />
            <span style={{ fontSize: 20, color: '#52525b', fontWeight: 600 }}>MyLink is now in Public Beta</span>
          </div>
          
          <h1 style={{ 
            display: 'flex',
            flexDirection: 'column',
            fontSize: 72, 
            color: '#18181b', 
            margin: 0, 
            letterSpacing: '-0.04em', 
            lineHeight: 1.1 
          }}>
            <span>One Link to</span>
            <span style={{ color: '#9333ea', marginTop: '4px' }}>Rule Them All.</span>
          </h1>
          
          <p style={{ 
            fontSize: 30, 
            color: '#71717a', 
            marginTop: '28px', 
            lineHeight: 1.5,
          }}>
            단 3초만에 로그인하고, 나만의 멋진 프로필 페이지를 만들어 세상에 공유하세요.
          </p>
        </div>

        {/* Visual Mockup Content */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: '360px', 
          height: '520px', 
          background: 'white', 
          borderRadius: '40px', 
          border: '12px solid #f4f4f5', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', 
          padding: '24px',
          position: 'relative',
          marginRight: '20px'
        }}>
          {/* Mockup Notch */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'absolute', top: -12, left: 0 }}>
             <div style={{ width: 120, height: 28, background: '#f4f4f5', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }} />
          </div>

          <div style={{ display: 'flex', width: 90, height: 90, borderRadius: 45, background: 'linear-gradient(to top right, #a855f7, #3b82f6)', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginTop: '36px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            🚀
          </div>
          <div style={{ width: 140, height: 20, background: '#e4e4e7', borderRadius: 10, marginTop: '20px' }} />
          <div style={{ width: 220, height: 16, background: '#f4f4f5', borderRadius: 8, marginTop: '12px', marginBottom: '32px' }} />
          
          <div style={{ display: 'flex', width: '100%', height: 64, background: '#fafafa', borderRadius: 16, alignItems: 'center', padding: '0 16px', marginBottom: '16px', border: '1px solid #f4f4f5' }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: '#e4e4e7' }} />
            <div style={{ display: 'flex', width: '60%', height: 16, background: '#e4e4e7', borderRadius: 8, marginLeft: '16px' }} />
          </div>
          <div style={{ display: 'flex', width: '100%', height: 64, background: '#fafafa', borderRadius: 16, alignItems: 'center', padding: '0 16px', marginBottom: '16px', border: '1px solid #f4f4f5' }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: '#e4e4e7' }} />
            <div style={{ display: 'flex', width: '80%', height: 16, background: '#e4e4e7', borderRadius: 8, marginLeft: '16px' }} />
          </div>
          <div style={{ display: 'flex', width: '100%', height: 64, background: '#fafafa', borderRadius: 16, alignItems: 'center', padding: '0 16px', marginBottom: '16px', border: '1px solid #f4f4f5' }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: '#e4e4e7' }} />
            <div style={{ display: 'flex', width: '40%', height: 16, background: '#e4e4e7', borderRadius: 8, marginLeft: '16px' }} />
          </div>
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
