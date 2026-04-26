// src/components/MessageForm.jsx
// Form for students to contact a landlord about a listing.

import React, { useState } from 'react';
import { FiSend, FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MessageForm = ({ listingId, landlordName }) => {
  const { isLoggedIn, isStudent } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await api.post('/messages', { listingId, message });
      setSent(true);
      setMessage('');
      toast.success('Message sent to landlord!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="card p-5 text-center">
        <FiMessageCircle size={28} className="mx-auto text-primary-400 mb-3" />
        <p className="text-sm text-dark-600 mb-3">
          Sign in to contact <strong>{landlordName}</strong>
        </p>
        <Link to="/login" className="btn-primary w-full justify-center">
          Sign in to message
        </Link>
      </div>
    );
  }

  if (!isStudent) {
    return null; // Landlords don't message other landlords
  }

  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-dark-900 mb-1 flex items-center gap-2">
        <FiMessageCircle size={18} className="text-primary-500" />
        Contact Landlord
      </h3>
      <p className="text-sm text-dark-500 mb-4">
        Message <strong>{landlordName}</strong> directly about this listing.
      </p>

      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-green-700 font-semibold text-sm">✅ Message sent!</p>
          <p className="text-green-600 text-xs mt-1">
            The landlord will get back to you soon.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-3 text-xs text-green-600 underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi, I'm interested in this listing. Is it still available? When can I come for a viewing?"
            rows={4}
            maxLength={1000}
            className="input resize-none"
            required
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{message.length}/1000</span>
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="btn-primary !py-2"
            >
              <FiSend size={14} />
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MessageForm;
