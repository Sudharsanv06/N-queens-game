import express from 'express'
import nodemailer from 'nodemailer'
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'

const router = express.Router()

// Rate limiting for contact form - 5 submissions per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: 'Too many contact form submissions. Please try again later.',
  },
  keyGenerator: (req) => ipKeyGenerator(req)
})

// Create transporter for email
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP service)
  if (process.env.NODE_ENV !== 'production') {
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    })
  }

  // For production, use environment variables
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

// Submit contact form
router.post('/submit', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    // Input validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' })
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' })
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: 'Subject is required' })
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }

    // Create transporter
    const transporter = createTransporter()

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@nqueensgame.com',
      to: process.env.CONTACT_EMAIL || 'support@nqueensgame.com',
      subject: `N-Queens Game Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; color: #6c757d;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
              This message was sent from the N-Queens Game contact form.
              <br>Timestamp: ${new Date().toISOString()}
            </p>
          </div>
        </div>
      `
    }

    // Auto-reply to user
    const autoReplyOptions = {
      from: process.env.EMAIL_USER || 'noreply@nqueensgame.com',
      to: email,
      subject: 'Thank you for contacting N-Queens Game Support',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
            Thank You for Your Message!
          </h2>
          
          <p style="color: #495057; line-height: 1.6;">Dear ${name},</p>
          
          <p style="color: #495057; line-height: 1.6;">
            Thank you for reaching out to the N-Queens Game support team. We have received your message 
            regarding "<strong>${subject}</strong>" and will get back to you within 24 hours.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Your Message Summary</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p style="color: #495057; line-height: 1.6;">
            In the meantime, feel free to explore our game features or check out our 
            <a href="#" style="color: #3498db;">FAQ section</a> for quick answers to common questions.
          </p>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p style="margin: 0; color: #155724;">
              <strong>🎮 Pro Tip:</strong> Try our daily challenges to improve your N-Queens solving skills!
            </p>
          </div>
          
          <p style="color: #495057; line-height: 1.6;">
            Best regards,<br>
            The N-Queens Game Team
          </p>
          
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin-top: 30px;">
            <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">
              This is an automated response. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    }

    // Send emails
    await transporter.sendMail(mailOptions)
    await transporter.sendMail(autoReplyOptions)

    console.log('Contact form email sent successfully:', { from: email, subject })

    res.status(200).json({
      message: 'Message sent successfully! We will get back to you within 24 hours.',
      success: true
    })

  } catch (error) {
    console.error('Contact form error:', error)
    
    // Don't expose internal errors to user
    res.status(500).json({
      message: 'Unable to send message at this time. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// Get contact information
router.get('/info', async (req, res) => {
  try {
    res.json({
      email: 'support@nqueensgame.com',
      website: 'www.nqueensgame.com',
      socialMedia: {
        twitter: '@nqueensgame',
        github: 'https://github.com/Sudharsanv06/n-queens_game'
      },
      responseTime: 'We typically respond within 24 hours',
      supportHours: '24/7 (automated responses), Business hours: 9 AM - 6 PM EST'
    })
  } catch (error) {
    console.error('Contact info error:', error)
    res.status(500).json({ message: 'Unable to fetch contact information' })
  }
})

export default router