import { Link } from 'react-router-dom'
import { FileText, MessageSquare, Zap } from 'lucide-react'

const FEATURES = [
  {
    icon: FileText,
    title: 'Upload PDF',
    desc: 'Drop any PDF and we instantly extract and process its full content.',
  },
  {
    icon: Zap,
    title: 'Vector Indexing',
    desc: 'Advanced chunking and embeddings for deep semantic understanding.',
  },
  {
    icon: MessageSquare,
    title: 'Ask Questions',
    desc: 'Get precise, context-aware answers grounded in your document.',
  },
]

const STACK = [
  { label: 'Backend',        detail: 'Node.js · Express · MongoDB' },
  { label: 'AI & Vectors',   detail: 'Gemini API · Pinecone · Sentence Transformers' },
  { label: 'Frontend',       detail: 'React 19 · Vite · TailwindCSS' },
  { label: 'Python Service', detail: 'FastAPI · sentence-transformers' },
]

const Home = () => (
  <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>

    {/* Nav */}
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid var(--color-border)',
      background: 'rgba(7,8,15,0.82)',
      backdropFilter: 'blur(16px)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', height: 60,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em',
                       background: 'linear-gradient(120deg, var(--color-accent-lt), #818cf8)',
                       WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          DocQuery
        </span>
        <Link to="/docquery" style={{
          padding: '7px 18px', borderRadius: 'var(--radius-md)',
          background: 'var(--color-accent)', color: '#fff',
          fontSize: 13, fontWeight: 600, letterSpacing: '0.01em',
          transition: 'opacity 0.15s, transform 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Launch App
        </Link>
      </div>
    </nav>

    {/* Hero + How It Works */}
    <section style={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '40px 32px',
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: 'absolute', top: 60, left: '15%',
        width: 420, height: 420,
        background: 'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)',
        animation: 'float 7s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 40, right: '12%',
        width: 340, height: 340,
        background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)',
        animation: 'float 8s ease-in-out infinite 3.5s',
        pointerEvents: 'none',
      }} />

      {/* Hero text */}
      <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', textAlign: 'center', marginBottom: 36 }}>
        <p style={{
          display: 'inline-block', marginBottom: 16,
          padding: '4px 14px', borderRadius: 'var(--radius-pill)',
          border: '1px solid rgba(124,58,237,0.35)',
          background: 'rgba(124,58,237,0.08)',
          fontSize: 12, fontWeight: 500, color: 'var(--color-accent-lt)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          AI-Powered · Knowledge Retrieval System
        </p>

        <h1 style={{
          fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 700,
          lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: 18,
          background: 'linear-gradient(160deg, #f1f0f5 30%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Chat with your<br />documents.
        </h1>

        <p style={{ fontSize: 16, color: 'var(--color-text-2)', maxWidth: 480,
                    margin: '0 auto 28px', lineHeight: 1.7 }}>
          Upload any PDF and ask natural-language questions. Get accurate,
          source-grounded answers in seconds.
        </p>

        <Link to="/docquery" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 26px', borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
          color: '#fff', fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';  e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,58,237,0.35)'; }}
        >
          Get Started <span style={{ fontSize: 18 }}>→</span>
        </Link>
      </div>

      {/* How It Works */}
      <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <h2 style={{ textAlign: 'center', fontSize: 18, fontWeight: 600,
                     letterSpacing: '0.04em', textTransform: 'uppercase',
                     marginBottom: 28, color: 'var(--color-text-3)' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {FEATURES.map((feature, i) => (
            <div key={feature.title} className="animate-slideUp" style={{
              animationDelay: `${i * 80}ms`,
              padding: '22px 22px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              transition: 'border-color 0.2s, transform 0.2s',
              background: 'var(--color-surface)',
              cursor: 'default',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 'var(--radius-md)',
                background: 'rgba(124,58,237,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <feature.icon size={18} color="var(--color-accent-lt)" />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: 'var(--color-text)' }}>{feature.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.65 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Tech Stack — visible on scroll */}
    <section style={{
      maxWidth: 1100, margin: '0 auto', padding: '40px 32px 40px',
      borderTop: '1px solid var(--color-border)',
    }}>
      <h2 style={{ textAlign: 'center', fontSize: 18, fontWeight: 600,
                   letterSpacing: '-0.04em', textTransform: 'uppercase', marginBottom: 28, color: 'var(--color-text-3)' }}>
        Tech Stack
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        {STACK.map(({ label, detail }) => (
          <div key={label} style={{
            padding: '18px 22px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent-lt)',
                        letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
              {label}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-2)' }}>{detail}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Footer */}
    <footer style={{
      borderTop: '1px solid var(--color-border)',
      padding: '18px 32px',
      textAlign: 'center',
      fontSize: 13,
      color: 'var(--color-text-3)',
    }}>
      DocQuery — Built with ❤️ using modern AI and web technologies
    </footer>

  </div>
)

export default Home