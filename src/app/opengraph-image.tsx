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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundImage: 'linear-gradient(to bottom right, #eef2ff, #ffffff, #faf5ff)',
          fontFamily: 'sans-serif',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Decorative Background Elements */}
        <div style={{ display: 'flex', position: 'absolute', top: -100, left: -50, width: 600, height: 600, borderRadius: 300, background: 'rgba(96, 165, 250, 0.15)' }} />
        <div style={{ display: 'flex', position: 'absolute', top: 50, right: 100, width: 500, height: 500, borderRadius: 250, background: 'rgba(192, 132, 252, 0.15)' }} />
        <div style={{ display: 'flex', position: 'absolute', bottom: -100, left: 300, width: 700, height: 700, borderRadius: 350, background: 'rgba(244, 114, 182, 0.15)' }} />

        {/* Text Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', zIndex: 10, maxWidth: '600px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '32px', 
            background: 'white', 
            padding: '12px 24px', 
            borderRadius: '50px', 
            border: '2px solid #e4e4e7',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: '#22c55e', marginRight: 12 }} />
            <span style={{ fontSize: 24, color: '#52525b', fontWeight: 600 }}>MyLink is now in Public Beta</span>
          </div>
          
          <h1 style={{ 
            display: 'flex',
            flexDirection: 'column',
            fontSize: 76, 
            fontWeight: 900, 
            color: '#18181b', 
            margin: 0, 
            letterSpacing: '-0.04em', 
            lineHeight: 1.1 
          }}>
            <span>One Link to</span>
            <span style={{ color: '#9333ea', marginTop: '4px' }}>Rule Them All.</span>
          </h1>
          
          <p style={{ 
            fontSize: 32, 
            color: '#71717a', 
            marginTop: '36px', 
            fontWeight: 500, 
            lineHeight: 1.5 
          }}>
            Google 계정으로 단 3초만에 로그인하고,<br/>나만의 멋진 프로필을 만들어 세상에 공유하세요.
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
          zIndex: 10,
          position: 'relative',
        }}>
          {/* Mockup Notch */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'absolute', top: -12, left: 0 }}>
             <div style={{ width: 140, height: 28, background: '#f4f4f5', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }} />
          </div>

          <div style={{ display: 'flex', width: 100, height: 100, borderRadius: 50, background: 'linear-gradient(to top right, #a855f7, #3b82f6)', alignItems: 'center', justifyContent: 'center', fontSize: 44, marginTop: '36px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            🚀
          </div>
          <div style={{ width: 140, height: 24, background: '#e4e4e7', borderRadius: 12, marginTop: '24px' }} />
          <div style={{ width: 220, height: 16, background: '#f4f4f5', borderRadius: 8, marginTop: '12px', marginBottom: '32px' }} />
          
          <div style={{ display: 'flex', width: '100%', height: 68, background: '#fafafa', borderRadius: 16, alignItems: 'center', padding: '0 20px', marginBottom: '16px', border: '1px solid #f4f4f5' }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: '#e4e4e7' }} />
            <div style={{ width: 120, height: 16, background: '#e4e4e7', borderRadius: 8, marginLeft: '16px' }} />
          </div>
          <div style={{ display: 'flex', width: '100%', height: 68, background: '#fafafa', borderRadius: 16, alignItems: 'center', padding: '0 20px', marginBottom: '16px', border: '1px solid #f4f4f5' }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: '#e4e4e7' }} />
            <div style={{ width: 160, height: 16, background: '#e4e4e7', borderRadius: 8, marginLeft: '16px' }} />
          </div>
          <div style={{ display: 'flex', width: '100%', height: 68, background: '#fafafa', borderRadius: 16, alignItems: 'center', padding: '0 20px', marginBottom: '16px', border: '1px solid #f4f4f5' }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: '#e4e4e7' }} />
            <div style={{ width: 100, height: 16, background: '#e4e4e7', borderRadius: 8, marginLeft: '16px' }} />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
