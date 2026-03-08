import React from 'react'

// ── Button ──────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, fullWidth, children, disabled, style, ...props }: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    fontFamily: 'DM Sans, sans-serif', fontWeight: 500, borderRadius: '8px',
    border: '1.5px solid transparent', cursor: loading || disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease', whiteSpace: 'nowrap', opacity: loading || disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
    ...(size === 'sm' ? { padding: '0.35rem 0.75rem', fontSize: '0.8rem' } :
        size === 'lg' ? { padding: '0.8rem 2rem', fontSize: '1rem' } :
        { padding: '0.6rem 1.25rem', fontSize: '0.875rem' }),
    ...(variant === 'primary' ? { background: '#1A1714', color: '#fff', borderColor: '#1A1714' } :
        variant === 'secondary' ? { background: 'transparent', color: '#1A1714', borderColor: '#D0CBC3' } :
        variant === 'ghost' ? { background: 'transparent', color: '#6B6560', borderColor: 'transparent' } :
        { background: 'transparent', color: '#B91C1C', borderColor: '#FECACA' }),
    ...style,
  }
  return (
    <button style={base} disabled={disabled || loading} {...props}>
      {loading && <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />}
      {children}
    </button>
  )
}

// ── Input ──────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  prefix?: string
}

export function Input({ label, hint, error, prefix, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {label && <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A1714', letterSpacing: '0.02em' }}>{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && <span style={{ position: 'absolute', left: '0.75rem', color: '#9C9590', fontSize: '0.875rem', pointerEvents: 'none' }}>{prefix}</span>}
        <input
          style={{
            width: '100%', padding: prefix ? '0.625rem 0.75rem 0.625rem 1.75rem' : '0.625rem 0.75rem',
            border: `1.5px solid ${error ? '#FECACA' : '#E8E4DF'}`, borderRadius: '8px',
            fontSize: '0.875rem', color: '#1A1714', background: '#FFFFFF', outline: 'none',
            fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.15s',
            ...style,
          }}
          onFocus={e => e.target.style.borderColor = error ? '#EF4444' : '#1A1714'}
          onBlur={e => e.target.style.borderColor = error ? '#FECACA' : '#E8E4DF'}
          {...props}
        />
      </div>
      {hint && !error && <p style={{ fontSize: '0.75rem', color: '#9C9590' }}>{hint}</p>}
      {error && <p style={{ fontSize: '0.75rem', color: '#B91C1C' }}>{error}</p>}
    </div>
  )
}

// ── Textarea ──────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
}

export function Textarea({ label, hint, style, ...props }: TextareaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {label && <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A1714', letterSpacing: '0.02em' }}>{label}</label>}
      <textarea
        style={{
          width: '100%', padding: '0.625rem 0.75rem', border: '1.5px solid #E8E4DF',
          borderRadius: '8px', fontSize: '0.875rem', color: '#1A1714', background: '#FFFFFF',
          outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', minHeight: 80,
          ...style,
        }}
        onFocus={e => e.target.style.borderColor = '#1A1714'}
        onBlur={e => e.target.style.borderColor = '#E8E4DF'}
        {...props}
      />
      {hint && <p style={{ fontSize: '0.75rem', color: '#9C9590' }}>{hint}</p>}
    </div>
  )
}

// ── Select ──────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, hint, options, placeholder, style, ...props }: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {label && <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A1714', letterSpacing: '0.02em' }}>{label}</label>}
      <select
        style={{
          width: '100%', padding: '0.625rem 0.75rem', border: '1.5px solid #E8E4DF',
          borderRadius: '8px', fontSize: '0.875rem', color: '#1A1714', background: '#FFFFFF',
          outline: 'none', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', ...style,
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <p style={{ fontSize: '0.75rem', color: '#9C9590' }}>{hint}</p>}
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────
export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'verified' | 'featured' | 'pending' | 'category' }) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: '#F3F0ED', color: '#6B6560' },
    verified: { background: '#EBF2EA', color: '#2D5A27' },
    featured: { background: '#1A1714', color: '#FFFFFF' },
    pending: { background: '#FFFBEB', color: '#92400E' },
    category: { background: '#F3F0ED', color: '#4A4540' },
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.625rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.03em', ...styles[variant] }}>
      {children}
    </span>
  )
}

// ── Alert ──────────────────────────────────────────────
export function Alert({ children, variant = 'error' }: { children: React.ReactNode; variant?: 'error' | 'success' | 'warning' }) {
  const styles = {
    error: { background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' },
    success: { background: '#EBF2EA', border: '1px solid #BBF7D0', color: '#166534' },
    warning: { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' },
  }
  return <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', ...styles[variant] }}>{children}</div>
}
