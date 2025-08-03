export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          ClickSprout v1.0
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
          Smart Product Promotion Tool
        </p>
        <p style={{ fontSize: '1rem', opacity: 0.8 }}>
          Transform product links into viral content
        </p>
        <div style={{ marginTop: '2rem' }}>
          <a 
            href="/submit" 
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'inline-block',
              marginRight: '1rem'
            }}
          >
            Get Started
          </a>
          <a 
            href="/test" 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'inline-block'
            }}
          >
            Test Page
          </a>
        </div>
      </div>
    </div>
  )
}
