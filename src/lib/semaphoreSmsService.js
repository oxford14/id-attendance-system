class SemaphoreSmsService {
  constructor() {
    this.apiKey = import.meta.env.VITE_SEMAPHORE_API_KEY;
    this.baseUrl = 'https://api.semaphore.co/api/v4';
    this.defaultSenderName = "SEMAPHORE";
    
    if (!this.apiKey) {
      console.warn('Semaphore API key not found in environment variables');
    }
  }

  /**
   * Send SMS using Semaphore API
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - Message content
   * @param {string} senderName - Optional sender name (defaults to 'SEMAPHORE')
   * @returns {Promise<Object>} Response object with success status and message details
   */
  async sendSMS(phoneNumber, message, senderName = null) {
    try {
      // Format phone number for Philippine numbers
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      // Prepare form data for Semaphore API
      const formData = new URLSearchParams();
      formData.append('apikey', this.apiKey);
      formData.append('number', formattedNumber);
      formData.append('message', message);
      
      // Use provided sender name or default
      if (senderName) {
        formData.append('sendername', senderName);
      } else {
        formData.append('sendername', this.defaultSenderName);
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.length > 0 && result[0].message_id) {
        const messageData = result[0];
        console.log('SMS sent successfully:', messageData.message_id);
        return {
          success: true,
          messageId: messageData.message_id,
          status: messageData.status,
          recipient: messageData.recipient,
          message: messageData.message,
          senderName: messageData.sender_name,
          network: messageData.network
        };
      } else {
        console.error('Failed to send SMS:', result);
        return {
          success: false,
          error: result.message || result.error || 'Unknown error occurred',
          errorCode: result.code
        };
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  /**
   * Format phone number for Philippine mobile numbers
   * @param {string} phoneNumber - Input phone number
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different Philippine number formats
    if (cleaned.startsWith('63')) {
      // Already has country code, remove it for Semaphore
      return cleaned.substring(2);
    } else if (cleaned.startsWith('09')) {
      // Mobile number starting with 09 - perfect for Semaphore
      return cleaned;
    } else if (cleaned.startsWith('9') && cleaned.length === 10) {
      // Mobile number without leading 0
      return `0${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      // 11-digit number starting with 0
      return cleaned;
    } else {
      // Default: assume it needs 0 prefix for Philippine mobile
      return `0${cleaned}`;
    }
  }

  /**
   * Create attendance notification message
   * @param {Object} studentData - Student information
   * @param {string} action - 'time_in' or 'time_out'
   * @param {Date} timestamp - Time of attendance
   * @returns {string} Formatted message
   */
  createAttendanceMessage(studentData, action, timestamp) {
    const timeStr = timestamp.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const dateStr = timestamp.toLocaleDateString('en-PH');
    const actionText = action === 'time_in' ? 'arrived at' : 'left';
    
    return `Hello! Your child ${studentData.first_name} ${studentData.last_name} has ${actionText} school at ${timeStr} on ${dateStr}.`;
  }

  /**
   * Send attendance notification to guardian
   * @param {Object} studentData - Student information including guardian_contact_number
   * @param {string} action - 'time_in' or 'time_out'
   * @param {Date} timestamp - Time of attendance
   * @returns {Promise<Object>} SMS sending result
   */
  async sendAttendanceNotification(studentData, action, timestamp = new Date()) {
    try {
      if (!studentData.guardian_contact_number) {
        console.warn('No guardian contact number found for student:', studentData.student_id);
        return {
          success: false,
          error: 'No guardian contact number available'
        };
      }

      const message = this.createAttendanceMessage(studentData, action, timestamp);
      return await this.sendSMS(studentData.guardian_contact_number, message, this.defaultSenderName);
    } catch (error) {
      console.error('Error sending attendance notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test the Semaphore SMS service configuration
   * @returns {Object} Configuration status
   */
  testConfiguration() {
    return {
      configured: !!this.apiKey,
      service: 'Semaphore SMS API',
      baseUrl: this.baseUrl,
      defaultSender: this.defaultSenderName
    };
  }
}

export default SemaphoreSmsService;