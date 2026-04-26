// src/pages/Register.jsx
// Registration with real-time password strength indicator.
// Password rules: 8+ chars, uppercase, lowercase, digit, special character.

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

// ── Password rule definitions ─────────────────────────────────────────────────
const RULES = [
  { id: 'length',    label: 'At least 8 characters',           test: (p) => p.length >= 8 },
  { id: 'upper',     label: 'One uppercase letter (A-Z)',       test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',     label: 'One lowercase letter (a-z)',       test: (p) => /[a-z]/.test(p) },
  { id: 'digit',     label: 'One number (0-9)',                 test: (p) => /\d/.test(p) },
  { id: 'special',   label: 'One special character (@$!%*?&#…)',test: (p) => /[@$!%*?&#^()_\-+=]/.test(p) },
];

const getStrength = (passed) => {
  if (passed === 0) return { level: 0, label: '', color: '' };
  if (passed <= 2)  return { level: 1, label: 'Weak',   color: 'bg-red-400' };
  if (passed <= 3)  return { level: 2, label: 'Fair',   color: 'bg-amber-400' };
  if (passed === 4) return { level: 3, label: 'Good',   color: 'bg-blue-400' };
  return              { level: 4, label: 'Strong', color: 'bg-green-500' };
};

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [touched, setTouched] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Evaluate all rules against current password
  const ruleResults = useMemo(() =>
    RULES.map((r) => ({ ...r, passed: r.test(form.password) })),
    [form.password]
  );
  const passedCount = ruleResults.filter((r) => r.passed).length;
  const strength = getStrength(passedCount);
  const allPassed = passedCount === RULES.length;

  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!allPassed) {
      toast.error('Please meet all password requirements.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    const { confirmPassword, ...payload } = form;
    const result = await register(payload);

    if (result.success) {
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl">🏠</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-dark-900">Create account</h1>
          <p className="text-dark-500 mt-2">Join HomeFinder Kenya — no broker fees</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selection */}
            <div>
              <label className="label">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {['student', 'landlord'].map((r) => (
                  <label
                    key={r}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold capitalize
                      ${form.role === r
                        ? 'border-primary-400 bg-primary-50 text-primary-600'
                        : 'border-gray-200 hover:border-gray-300 text-dark-600'}`}
                  >
                    <input
                      type="radio" name="role" value={r}
                      checked={form.role === r} onChange={handleChange}
                      className="sr-only"
                    />
                    {r === 'student' ? '🎓' : '🏠'} {r}
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <FiUser size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="name" type="text" value={form.name} onChange={handleChange}
                  placeholder="John Kamau" className="input !pl-10" required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" className="input !pl-10" required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="label">
                Phone number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <FiPhone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="+254 7XX XXX XXX" className="input !pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => { handleChange(e); setTouched(true); }}
                  placeholder="Create a strong password"
                  className="input !pl-10 !pr-10"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {touched && form.password.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          className={`flex-1 h-full rounded-full transition-all duration-300 ${
                            strength.level >= seg ? strength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <span className={`text-xs font-semibold ${
                        strength.level === 1 ? 'text-red-500' :
                        strength.level === 2 ? 'text-amber-500' :
                        strength.level === 3 ? 'text-blue-500' : 'text-green-600'
                      }`}>
                        {strength.label}
                      </span>
                    )}
                  </div>

                  {/* Rule checklist */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                    {ruleResults.map((rule) => (
                      <div key={rule.id} className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          rule.passed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {rule.passed
                            ? <FiCheck size={10} strokeWidth={3} />
                            : <FiX size={10} strokeWidth={2} />
                          }
                        </span>
                        <span className={`text-xs ${rule.passed ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="label">Confirm password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`input !pl-10 !pr-10 ${
                    form.confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-green-400 focus:ring-green-300'
                        : 'border-red-400 focus:ring-red-200'
                      : ''
                  }`}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {form.confirmPassword.length > 0 && (
                <p className={`text-xs mt-1 font-medium ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordsMatch ? '✅ Passwords match' : '❌ Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full !py-3 text-base"
              disabled={loading || !allPassed || !passwordsMatch}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
