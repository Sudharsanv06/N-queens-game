import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);

  React.useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get('/api/contact/info');
        setContactInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch contact info:', error);
      }
    };
    fetchContactInfo();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/contact/submit', formData);
      
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
        <div className="contact-container">
          <h1>Contact Us</h1>
          
          <div className="contact-content">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p>
                Have questions about the N-Queens game? Want to report a bug or suggest a feature? 
                We'd love to hear from you!
              </p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <h3>📧 Email</h3>
                  <p>support@nqueensgame.com</p>
                </div>
                
                <div className="contact-item">
                  <h3>🌐 Website</h3>
                  <p>www.nqueensgame.com</p>
                </div>
                
                <div className="contact-item">
                  <h3>📱 Social Media</h3>
                  <p>Follow us on Twitter and GitHub</p>
                </div>
                
                <div className="contact-item">
                  <h3>⏰ Response Time</h3>
                  <p>We typically respond within 24 hours</p>
                </div>
              </div>
            </div>
            
            <div className="contact-form">
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-btn">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Contact; 