// Parent Notification Service
// Handles email and SMS notifications when students scan their RFID

class NotificationService {
  constructor() {
    this.emailApiKey = import.meta.env.VITE_EMAIL_SERVICE_API_KEY
    this.smsApiKey = import.meta.env.VITE_SMS_SERVICE_API_KEY
    this.emailServiceUrl = 'https://api.emailjs.com/api/v1.0/email/send' // Example: EmailJS
    this.smsServiceUrl = 'https://api.twilio.com/2010-04-01/Accounts' // Example: Twilio
  }

  /**
   * Send notification to parent when student scans RFID
   * @param {Object} student - Student object with parent contact info
   * @param {string} timestamp - When the scan occurred
   */
  async sendAttendanceNotification(student, timestamp = new Date().toISOString()) {
    const message = this.createAttendanceMessage(student, timestamp)
    const results = []

    try {
      // Send email notification if parent has email
      if (student.parent_email && this.emailApiKey) {
        const emailResult = await this.sendEmail(
          student.parent_email,
          `${student.first_name} Arrived at School`,
          message.email
        )
        results.push({ type: 'email', success: emailResult.success, error: emailResult.error })
      }

      // Send SMS notification if parent has phone
      if (student.parent_phone && this.smsApiKey) {
        const smsResult = await this.sendSMS(
          student.parent_phone,
          message.sms
        )
        results.push({ type: 'sms', success: smsResult.success, error: smsResult.error })
      }

      // Log notification attempt
      console.log('Notification sent:', {
        student: `${student.first_name} ${student.last_name}`,
        timestamp,
        results
      })

      return {
        success: results.some(r => r.success),
        results
      }
    } catch (error) {
      console.error('Notification service error:', error)
      return {
        success: false,
        error: error.message,
        results
      }
    }
  }

  /**
   * Create formatted messages for different notification types
   */
  createAttendanceMessage(student, timestamp) {
    const time = new Date(timestamp).toLocaleTimeString()
    const date = new Date(timestamp).toLocaleDateString()

    return {
      email: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">School Attendance Notification</h2>
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">✅ ${student.first_name} ${student.last_name} has arrived at school</h3>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 5px 0;"><strong>Grade:</strong> ${student.grade}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This is an automated message from the school attendance system.</p>
        </div>
      `,
      sms: `🏫 ${student.first_name} ${student.last_name} arrived at school at ${time} on ${date}. Grade: ${student.grade}`
    }
  }

  /**
   * Send email notification using EmailJS or similar service
   */
  async sendEmail(to, subject, htmlContent) {
    if (!this.emailApiKey) {
      console.warn('Email API key not configured')
      return { success: false, error: 'Email service not configured' }
    }

    try {
      // Example implementation for EmailJS
      // Replace with your preferred email service
      const response = await fetch(this.emailServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'your_service_id',
          template_id: 'your_template_id',
          user_id: this.emailApiKey,
          template_params: {
            to_email: to,
            subject: subject,
            message: htmlContent
          }
        })
      })

      if (response.ok) {
        return { success: true }
      } else {
        throw new Error(`Email service responded with status: ${response.status}`)
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send SMS notification using Twilio or similar service
   */
  async sendSMS(to, message) {
    if (!this.smsApiKey) {
      console.warn('SMS API key not configured')
      return { success: false, error: 'SMS service not configured' }
    }

    try {
      // Example implementation for Twilio
      // Replace with your preferred SMS service
      const accountSid = 'your_account_sid'
      const authToken = this.smsApiKey
      const fromNumber = 'your_twilio_number'

      const response = await fetch(`${this.smsServiceUrl}/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: to,
          Body: message
        })
      })

      if (response.ok) {
        return { success: true }
      } else {
        throw new Error(`SMS service responded with status: ${response.status}`)
      }
    } catch (error) {
      console.error('SMS sending failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Test notification configuration
   */
  async testConfiguration() {
    const config = {
      email: {
        configured: !!this.emailApiKey,
        service: 'EmailJS (or your preferred service)'
      },
      sms: {
        configured: !!this.smsApiKey,
        service: 'Twilio (or your preferred service)'
      }
    }

    console.log('Notification service configuration:', config)
    return config
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService()

// Export class for testing
export { NotificationService }