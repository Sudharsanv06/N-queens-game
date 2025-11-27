import nodemailer from 'nodemailer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class EmailService {
  constructor() {
    this.transporter = this.createTransporter()
  }

  createTransporter() {
    // Use environment variables for email configuration
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true' || false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('Email credentials not configured. Email functionality will be limited.')
      return null
    }

    return nodemailer.createTransporter(emailConfig)
  }

  async sendEmail(options) {
    if (!this.transporter) {
      console.error('Email transporter not configured')
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const mailOptions = {
        from: `"N-Queens Game" <${process.env.EMAIL_USER}>`,
        ...options
      }

      const result = await this.transporter.sendMail(mailOptions)
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      }
    } catch (error) {
      console.error('Error sending email:', error)
      return { success: false, error: error.message }
    }
  }

  // Welcome email template
  generateWelcomeEmail(userName, userEmail) {
    const welcomeHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to N-Queens Game</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .crown {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .content {
            padding: 2rem;
          }
          .welcome-message {
            font-size: 1.2rem;
            margin-bottom: 1.5rem;
            color: #555;
          }
          .features {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1.5rem 0;
          }
          .feature-list {
            list-style: none;
            padding: 0;
          }
          .feature-list li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
          }
          .feature-list li:last-child {
            border-bottom: none;
          }
          .feature-icon {
            margin-right: 1rem;
            font-size: 1.5rem;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 1rem 2rem;
            border-radius: 25px;
            font-weight: bold;
            margin: 1rem 0;
            text-align: center;
            transition: transform 0.3s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          .footer {
            background-color: #2d3748;
            color: #a0aec0;
            padding: 1.5rem;
            text-align: center;
            font-size: 0.9rem;
          }
          .achievement-preview {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            text-align: center;
            color: #8b7355;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="crown">👑</div>
            <h1>Welcome to N-Queens!</h1>
            <p>Your strategic puzzle adventure begins now</p>
          </div>
          
          <div class="content">
            <div class="welcome-message">
              <strong>Hello ${userName}!</strong><br>
              Welcome to the most challenging and rewarding N-Queens puzzle game! We're excited to have you join our community of strategic thinkers and puzzle masters.
            </div>

            <div class="achievement-preview">
              <h3 style="margin: 0 0 0.5rem 0;">🏆 Your First Achievement Awaits!</h3>
              <p style="margin: 0; font-weight: bold;">"First Victory" - Complete your first puzzle to unlock it!</p>
            </div>

            <div class="features">
              <h3 style="color: #4a5568; margin-top: 0;">What's Waiting for You:</h3>
              <ul class="feature-list">
                <li>
                  <span class="feature-icon">🎯</span>
                  <div>
                    <strong>Multiple Game Modes</strong><br>
                    Classic, Time Trial, Daily Challenges, and Multiplayer
                  </div>
                </li>
                <li>
                  <span class="feature-icon">🏅</span>
                  <div>
                    <strong>Achievement System</strong><br>
                    Unlock badges, earn points, and track your progress
                  </div>
                </li>
                <li>
                  <span class="feature-icon">📱</span>
                  <div>
                    <strong>Cross-Platform</strong><br>
                    Play on web, mobile, and get push notifications
                  </div>
                </li>
                <li>
                  <span class="feature-icon">🌟</span>
                  <div>
                    <strong>Global Leaderboards</strong><br>
                    Compete with players worldwide and climb the ranks
                  </div>
                </li>
                <li>
                  <span class="feature-icon">👥</span>
                  <div>
                    <strong>Social Features</strong><br>
                    Challenge friends and share your victories
                  </div>
                </li>
              </ul>
            </div>

            <div style="text-align: center; margin: 2rem 0;">
              <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/game-mode-selection" class="cta-button">
                🚀 Start Playing Now
              </a>
            </div>

            <div style="background-color: #e6f3ff; border-radius: 8px; padding: 1rem; margin: 1.5rem 0;">
              <h4 style="color: #2b6cb0; margin: 0 0 0.5rem 0;">💡 Pro Tips for Beginners:</h4>
              <ul style="margin: 0; color: #2b6cb0;">
                <li>Start with smaller board sizes (4x4 or 6x6) to learn the basics</li>
                <li>Remember: Queens attack horizontally, vertically, and diagonally</li>
                <li>Use the hint system if you get stuck - but try to solve it yourself first!</li>
                <li>Check out our tutorial section for advanced strategies</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>Happy puzzle solving!<br>
            <strong>The N-Queens Game Team</strong></p>
            <p style="font-size: 0.8rem; margin-top: 1rem;">
              If you have any questions, feel free to contact us through our support system.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    return {
      subject: '👑 Welcome to N-Queens Game - Your Strategic Adventure Awaits!',
      html: welcomeHtml,
      text: `Welcome to N-Queens Game, ${userName}!

Your strategic puzzle adventure begins now. We're excited to have you join our community of puzzle masters!

What's waiting for you:
• Multiple Game Modes: Classic, Time Trial, Daily Challenges, and Multiplayer
• Achievement System: Unlock badges, earn points, and track your progress  
• Cross-Platform: Play on web, mobile, and get push notifications
• Global Leaderboards: Compete with players worldwide
• Social Features: Challenge friends and share victories

Start playing now: ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/game-mode-selection

Pro Tips for Beginners:
- Start with smaller board sizes (4x4 or 6x6) to learn the basics
- Remember: Queens attack horizontally, vertically, and diagonally  
- Use the hint system if you get stuck
- Check out our tutorial section for advanced strategies

Happy puzzle solving!
The N-Queens Game Team`
    }
  }

  // Password reset email template
  generatePasswordResetEmail(userName, resetToken, userEmail) {
    const resetUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`
    
    const resetHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - N-Queens Game</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 2rem;
            text-align: center;
          }
          .content {
            padding: 2rem;
          }
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 1rem 2rem;
            border-radius: 25px;
            font-weight: bold;
            margin: 1rem 0;
            text-align: center;
          }
          .warning-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 1rem;
            margin: 1.5rem 0;
            color: #856404;
          }
          .footer {
            background-color: #2d3748;
            color: #a0aec0;
            padding: 1.5rem;
            text-align: center;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Secure your N-Queens Game account</p>
          </div>
          
          <div class="content">
            <p><strong>Hello ${userName},</strong></p>
            
            <p>We received a request to reset your password for your N-Queens Game account. If you made this request, click the button below to set a new password:</p>

            <div style="text-align: center; margin: 2rem 0;">
              <a href="${resetUrl}" class="reset-button">
                🔑 Reset My Password
              </a>
            </div>

            <div class="warning-box">
              <h4 style="margin: 0 0 0.5rem 0;">⚠️ Important Security Information:</h4>
              <ul style="margin: 0;">
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged unless you click the link above</li>
                <li>Never share this reset link with anyone</li>
              </ul>
            </div>

            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 1rem; border-radius: 4px; font-family: monospace;">
              ${resetUrl}
            </p>

            <p>If you're having trouble or didn't request this password reset, please contact our support team.</p>
          </div>

          <div class="footer">
            <p><strong>The N-Queens Game Team</strong></p>
            <p style="font-size: 0.8rem; margin-top: 1rem;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    return {
      subject: '🔐 Reset Your N-Queens Game Password',
      html: resetHtml,
      text: `Password Reset - N-Queens Game

Hello ${userName},

We received a request to reset your password for your N-Queens Game account. If you made this request, use the link below to set a new password:

${resetUrl}

Important Security Information:
- This link will expire in 1 hour for security reasons
- If you didn't request this reset, please ignore this email
- Your password will remain unchanged unless you use the link above
- Never share this reset link with anyone

If you're having trouble or didn't request this password reset, please contact our support team.

The N-Queens Game Team`
    }
  }

  // Game invitation email template
  generateGameInviteEmail(fromUserName, toUserName, gameMode, gameUrl) {
    const inviteHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Game Invitation - N-Queens Game</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 2rem;
            text-align: center;
          }
          .content {
            padding: 2rem;
          }
          .join-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 1rem 2rem;
            border-radius: 25px;
            font-weight: bold;
            margin: 1rem 0;
            text-align: center;
          }
          .game-info {
            background-color: #e6f3ff;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            border-left: 4px solid #4facfe;
          }
          .footer {
            background-color: #2d3748;
            color: #a0aec0;
            padding: 1.5rem;
            text-align: center;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 Game Invitation</h1>
            <p>You've been challenged to a match!</p>
          </div>
          
          <div class="content">
            <p><strong>Hello ${toUserName},</strong></p>
            
            <p><strong>${fromUserName}</strong> has invited you to join a ${gameMode} game in N-Queens! Are you ready for the challenge?</p>

            <div class="game-info">
              <h3 style="margin: 0 0 1rem 0; color: #2b6cb0;">🎯 Game Details</h3>
              <ul style="margin: 0; color: #2b6cb0;">
                <li><strong>Challenger:</strong> ${fromUserName}</li>
                <li><strong>Game Mode:</strong> ${gameMode}</li>
                <li><strong>Challenge Type:</strong> Head-to-head puzzle solving</li>
                <li><strong>Stakes:</strong> Glory and bragging rights! 🏆</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 2rem 0;">
              <a href="${gameUrl}" class="join-button">
                ⚔️ Accept Challenge
              </a>
            </div>

            <p>Don't keep ${fromUserName} waiting - show them what you're made of! May the best strategist win!</p>

            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 1rem; margin: 1.5rem 0;">
              <h4 style="color: #4a5568; margin: 0 0 0.5rem 0;">💡 Battle Tips:</h4>
              <ul style="margin: 0; color: #4a5568;">
                <li>Stay calm under pressure - rushed moves lead to mistakes</li>
                <li>Think several moves ahead like in chess</li>
                <li>Use the process of elimination to your advantage</li>
                <li>Remember: every queen must be safe from all others!</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>Good luck and have fun!<br>
            <strong>The N-Queens Game Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `

    return {
      subject: `🎮 ${fromUserName} challenges you to N-Queens - ${gameMode}!`,
      html: inviteHtml,
      text: `Game Invitation - N-Queens Game

Hello ${toUserName},

${fromUserName} has invited you to join a ${gameMode} game in N-Queens! Are you ready for the challenge?

Game Details:
- Challenger: ${fromUserName}
- Game Mode: ${gameMode}
- Challenge Type: Head-to-head puzzle solving
- Stakes: Glory and bragging rights!

Accept the challenge: ${gameUrl}

Don't keep ${fromUserName} waiting - show them what you're made of!

Battle Tips:
- Stay calm under pressure - rushed moves lead to mistakes
- Think several moves ahead like in chess  
- Use the process of elimination to your advantage
- Remember: every queen must be safe from all others!

Good luck and have fun!
The N-Queens Game Team`
    }
  }

  // Send welcome email
  async sendWelcomeEmail(userName, userEmail) {
    const emailContent = this.generateWelcomeEmail(userName, userEmail)
    
    return await this.sendEmail({
      to: userEmail,
      ...emailContent
    })
  }

  // Send password reset email
  async sendPasswordResetEmail(userName, userEmail, resetToken) {
    const emailContent = this.generatePasswordResetEmail(userName, resetToken, userEmail)
    
    return await this.sendEmail({
      to: userEmail,
      ...emailContent
    })
  }

  // Send game invitation email
  async sendGameInviteEmail(fromUserName, toUserName, toUserEmail, gameMode, gameUrl) {
    const emailContent = this.generateGameInviteEmail(fromUserName, toUserName, gameMode, gameUrl)
    
    return await this.sendEmail({
      to: toUserEmail,
      ...emailContent
    })
  }

  // Send achievement notification email (optional, as push notifications are primary)
  async sendAchievementNotificationEmail(userName, userEmail, achievement) {
    const achievementHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Achievement Unlocked - N-Queens Game</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #8b7355; padding: 2rem; text-align: center; }
          .content { padding: 2rem; }
          .achievement-badge { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 2rem; border-radius: 12px; margin: 1rem 0; }
          .footer { background-color: #2d3748; color: #a0aec0; padding: 1.5rem; text-align: center; font-size: 0.9rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Achievement Unlocked!</h1>
            <p>Congratulations on your latest accomplishment!</p>
          </div>
          <div class="content">
            <p><strong>Hello ${userName},</strong></p>
            <p>You've just unlocked a new achievement in N-Queens Game!</p>
            <div class="achievement-badge">
              <div style="font-size: 3rem; margin-bottom: 1rem;">${achievement.icon}</div>
              <h2 style="margin: 0;">${achievement.name}</h2>
              <p style="margin: 0.5rem 0;">${achievement.description}</p>
              <div style="font-size: 1.2rem; font-weight: bold;">+${achievement.points} Points</div>
            </div>
            <p>Keep up the great work and continue your puzzle-solving journey!</p>
          </div>
          <div class="footer">
            <p><strong>The N-Queens Game Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: userEmail,
      subject: `🏆 Achievement Unlocked: ${achievement.name}!`,
      html: achievementHtml,
      text: `Achievement Unlocked - N-Queens Game

Hello ${userName},

You've just unlocked a new achievement in N-Queens Game!

🏆 ${achievement.name}
${achievement.description}
+${achievement.points} Points

Keep up the great work and continue your puzzle-solving journey!

The N-Queens Game Team`
    })
  }
}

export default EmailService