import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Please enter your email or employee ID');
      return;
    }
    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        navigate(result.redirectPath);
      } else {
        setError('Invalid credentials. Try username: rajesh.kumar (any password for demo)');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string) => {
    setUsername(email);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Building2 className="w-10 h-10 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">WorkForce Pro</h1>
          </div>
          <p className="text-slate-400">Employee & Project Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in to your account</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="input-field" placeholder="Enter username (e.g., rajesh.kumar)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10" placeholder="Enter any password for demo" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-3">Quick Login (Demo Accounts - use any password):</p>
            <div className="space-y-2">
              <button onClick={() => quickLogin('suresh.nair')} className="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-900">Admin — Suresh Nair</p>
                  <span className="badge bg-indigo-100 text-indigo-700">Admin Panel</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Username: suresh.nair</p>
              </button>
              <button onClick={() => quickLogin('vikram.singh')} className="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-900">Admin — Vikram Singh</p>
                  <span className="badge bg-indigo-100 text-indigo-700">Admin Panel</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Username: vikram.singh</p>
              </button>
              <button onClick={() => quickLogin('rajesh.kumar')} className="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-900">Admin — Rajesh Kumar</p>
                  <span className="badge bg-indigo-100 text-indigo-700">Admin Panel</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Username: rajesh.kumar</p>
              </button>
              <button onClick={() => quickLogin('priya.sharma')} className="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-900">Employee — Priya Sharma</p>
                  <span className="badge bg-emerald-100 text-emerald-700">Employee Panel</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Username: priya.sharma</p>
              </button>
              <button onClick={() => quickLogin('ananya.gupta')} className="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-900">Employee — Ananya Gupta</p>
                  <span className="badge bg-emerald-100 text-emerald-700">Employee Panel</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Username: ananya.gupta</p>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          © 2024 TechCorp Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
}
