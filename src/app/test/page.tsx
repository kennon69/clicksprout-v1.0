export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ClickSprout Test Page</h1>
      <p>If you can see this, the basic Next.js setup is working.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  )
}
