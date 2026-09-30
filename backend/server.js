// =============================================================================
// Backend server — saves feedback from the React form to MongoDB
// =============================================================================

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

// ─── 1. Setup Express ───
const app = express()
app.use(cors())              // allow requests from your React app
app.use(express.json())      // parse JSON bodies

// ─── 2. Connect to MongoDB ───
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Failed:', err.message))

// ─── 3. Define the Feedback schema ───
const feedbackSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true },
  phone:    { type: String, required: true },
  age:      { type: Number },
  gender:   { type: String },
  rating:   { type: Number, required: true },     // ← NEW
  category: { type: String, required: true },     // ← NEW
  message:  { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
})

const Feedback = mongoose.model('Feedback', feedbackSchema)

// ─── 4. Test route — check server is alive ───
app.get('/', (req, res) => {
  res.send('Backend is running ✅')
})

// ─── 5. POST route — receives feedback from the form ───
app.post('/api/feedback', async (req, res) => {
  try {
    const newFeedback = new Feedback(req.body)
    await newFeedback.save()
    console.log('📥 Saved feedback from:', req.body.fullName, '→ rating:', req.body.rating, '→ category:', req.body.category)
    res.status(201).json({ message: 'Feedback saved successfully!' })
  } catch (error) {
    console.error('❌ Save failed:', error.message)
    res.status(500).json({ error: 'Failed to save feedback' })
  }
})

// ─── 6. Start the server ───
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))