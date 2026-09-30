import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type FormData = {
  fullName: string
  email: string
  phone: string
  age: string
  gender: string
  rating: string
  category: string
  message: string
  agree: boolean
}

type FormErrors = Partial<Record<keyof FormData, string>>

export default function FeedbackPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    rating: '',
    category: '',
    message: '',
    agree: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  /* ---- Live-strip disallowed characters as user types ---- */
  const handleNameChange = (v: string) => {
    setField('fullName', v.replace(/[^A-Za-z\s]/g, ''))
  }
  const handlePhoneChange = (v: string) => {
    setField('phone', v.replace(/\D/g, '').slice(0, 10))
  }

  const validate = (data: FormData): FormErrors => {
    const e: FormErrors = {}

    if (!data.fullName.trim()) {
      e.fullName = 'Full name is required.'
    } else if (data.fullName.trim().length < 3) {
      e.fullName = 'Name must be at least 3 characters.'
    } else if (!/^[A-Za-z\s]+$/.test(data.fullName.trim())) {
      e.fullName = 'Name can contain only letters (A–Z, a–z) and spaces.'
    }

    if (!data.email.trim()) {
      e.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())) {
      e.email = 'Enter a valid email (e.g., name@example.com).'
    }

    if (!data.phone.trim()) {
      e.phone = 'Phone number is required.'
    } else if (!/^\d{10}$/.test(data.phone.trim())) {
      e.phone = 'Phone must be exactly 10 digits (0–9).'
    }

    if (!data.age.trim()) {
      e.age = 'Age is required.'
    } else {
      const n = Number(data.age)
      if (!Number.isFinite(n) || n < 13 || n > 120) {
        e.age = 'Age must be between 13 and 120.'
      }
    }

    if (!data.gender) {
      e.gender = 'Please select a gender.'
    }

    if (!data.rating) {
      e.rating = 'Please select a rating.'
    }

    if (!data.category) {
      e.category = 'Please select a category.'
    }

    if (!data.message.trim()) {
      e.message = 'Message is required.'
    } else if (data.message.trim().length < 10) {
      e.message = 'Message must be at least 10 characters.'
    }

    if (!data.agree) {
      e.agree = 'You must accept the terms to continue.'
    }

    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const found = validate(form)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      alert('Please fix the highlighted errors before submitting.')

      const firstKey = Object.keys(found)[0]
      const el = document.getElementById(firstKey)
      el?.focus()
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('Server rejected the request')
      }

      alert(`Thank you, ${form.fullName}! Your feedback has been submitted.`)
      setSubmitted(true)
    } catch (error) {
      console.error('Submit failed:', error)
      alert('There was an error submitting your feedback. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="page-shell customer-page" style={{ paddingTop: 40 }}>
        <div className="glass-card" style={{ padding: 32, maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ marginTop: 0 }}>Thank you! 🎉</h2>
          <p style={{ color: 'var(--muted)' }}>
            Your feedback has been received. We'll get back to you soon.
          </p>
          <button
            type="button"
            className="primary-button full-width"
            onClick={() => navigate('/menu/restaurant-demo')}
          >
            Back to Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell customer-page" style={{ paddingTop: 40 }}>
      <div
        className="glass-card"
        style={{ padding: 32, maxWidth: 720, margin: '0 auto' }}
      >
        <h2 style={{ marginTop: 0 }}>Feedback / Registration</h2>
        <p style={{ color: 'var(--muted)' }}>
          Fill in the form below. All fields are required.
        </p>

        <form onSubmit={handleSubmit} noValidate className="row g-3">
          {/* Full Name */}
          <div className="col-md-6">
            <label className="form-label">Full Name *</label>
            <input
              id="fullName"
              type="text"
              className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
              value={form.fullName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Rohan Sharma"
              autoComplete="name"
            />
            {errors.fullName && (
              <div className="invalid-feedback d-block">{errors.fullName}</div>
            )}
          </div>

          {/* Email */}
          <div className="col-md-6">
            <label className="form-label">Email *</label>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <div className="invalid-feedback d-block">{errors.email}</div>
            )}
          </div>

          {/* Phone */}
          <div className="col-md-6">
            <label className="form-label">Phone *</label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              value={form.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="10-digit mobile number"
              maxLength={10}
              autoComplete="tel"
            />
            {errors.phone && (
              <div className="invalid-feedback d-block">{errors.phone}</div>
            )}
          </div>

          {/* Age */}
          <div className="col-md-6">
            <label className="form-label">Age *</label>
            <input
              id="age"
              type="number"
              className={`form-control ${errors.age ? 'is-invalid' : ''}`}
              value={form.age}
              onChange={(e) => setField('age', e.target.value)}
              placeholder="e.g., 24"
              min={13}
              max={120}
            />
            {errors.age && (
              <div className="invalid-feedback d-block">{errors.age}</div>
            )}
          </div>

          {/* Gender */}
          <div className="col-12">
            <label className="form-label d-block">Gender *</label>
            {(['Male', 'Female', 'Other'] as const).map((g) => (
              <div className="form-check form-check-inline" key={g}>
                <input
                  className={`form-check-input ${errors.gender ? 'is-invalid' : ''}`}
                  type="radio"
                  name="gender"
                  id={`gender-${g}`}
                  checked={form.gender === g}
                  onChange={() => setField('gender', g)}
                />
                <label className="form-check-label" htmlFor={`gender-${g}`}>
                  {g}
                </label>
              </div>
            ))}
            {errors.gender && (
              <div className="invalid-feedback d-block">{errors.gender}</div>
            )}
          </div>

          {/* Rating */}
          <div className="col-12">
            <label className="form-label d-block">Rating *</label>
            {(['1', '2', '3', '4', '5'] as const).map((r) => (
              <div className="form-check form-check-inline" key={r}>
                <input
                  className={`form-check-input ${errors.rating ? 'is-invalid' : ''}`}
                  type="radio"
                  name="rating"
                  id={`rating-${r}`}
                  checked={form.rating === r}
                  onChange={() => setField('rating', r)}
                />
                <label className="form-check-label" htmlFor={`rating-${r}`}>
                  {r} ⭐
                </label>
              </div>
            ))}
            {errors.rating && (
              <div className="invalid-feedback d-block">{errors.rating}</div>
            )}
          </div>

          {/* Category */}
          <div className="col-md-6">
            <label className="form-label">Category *</label>
            <select
              id="category"
              className={`form-select ${errors.category ? 'is-invalid' : ''}`}
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
            >
              <option value="">— Select a category —</option>
              <option value="Food">Food</option>
              <option value="Service">Service</option>
              <option value="Ambience">Ambience</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <div className="invalid-feedback d-block">{errors.category}</div>
            )}
          </div>

          {/* Message */}
          <div className="col-12">
            <label className="form-label">Your Feedback *</label>
            <textarea
              id="message"
              rows={4}
              className={`form-control ${errors.message ? 'is-invalid' : ''}`}
              value={form.message}
              onChange={(e) => setField('message', e.target.value)}
              placeholder="Tell us what you think about ARtex 3D Menu..."
            />
            {errors.message && (
              <div className="invalid-feedback d-block">{errors.message}</div>
            )}
          </div>

          {/* Agree */}
          <div className="col-12">
            <div className="form-check">
              <input
                id="agree"
                className={`form-check-input ${errors.agree ? 'is-invalid' : ''}`}
                type="checkbox"
                checked={form.agree}
                onChange={(e) => setField('agree', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="agree">
                I agree to the terms and privacy policy.
              </label>
              {errors.agree && (
                <div className="invalid-feedback d-block">{errors.agree}</div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="col-12 d-flex gap-2">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate('/menu/restaurant-demo')}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}