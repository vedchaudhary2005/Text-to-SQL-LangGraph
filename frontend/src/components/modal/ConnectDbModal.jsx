import React, { useState } from 'react';
import { X, Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export default function ConnectDbModal({
  isOpen,
  onClose,
  onConnected,
  initialConfig = {},
}) {
  const [formData, setFormData] = useState({
    host: initialConfig.host || 'localhost',
    port: initialConfig.port || 3306,
    username: initialConfig.username || 'root',
    password: '',
    database: initialConfig.database || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'port' ? Number(value) || '' : value,
    }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.host || !formData.username || !formData.database) {
      setError('Please provide host, username, and database name.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.connectDatabase({
        host: formData.host,
        port: Number(formData.port) || 3306,
        username: formData.username,
        password: formData.password,
        database: formData.database,
      });

      if (response && response.success) {
        setSuccessMessage(response.message || 'Database connected successfully!');
        onConnected({
          host: formData.host,
          port: Number(formData.port) || 3306,
          username: formData.username,
          database: formData.database,
        });

        // Close modal shortly after success
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to database. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-surface-200 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">Connect MySQL Database</h2>
              <p className="text-[11px] text-slate-400">Configure connection for Text-to-SQL analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            type="button"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {/* Status Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed break-words">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-2.5 text-emerald-300 text-xs">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form id="connect-db-form" onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-300 mb-1">Host</label>
                <input
                  type="text"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  placeholder="localhost or 127.0.0.1"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-surface-100 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Port</label>
                <input
                  type="number"
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  placeholder="3306"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-surface-100 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Database Name</label>
              <input
                type="text"
                name="database"
                value={formData.database}
                onChange={handleChange}
                placeholder="e.g. sales_db"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-surface-100 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="root"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-surface-100 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-surface-100 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
              Note: Credentials are sent directly to the local FastAPI backend to initialize the SQLAlchemy engine. Passwords are never stored in browser storage.
            </p>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 p-4 sm:p-5 border-t border-slate-800 flex-shrink-0 bg-surface-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium text-xs text-center"
          >
            Cancel
          </button>
          <button
            form="connect-db-form"
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-xs"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Database size={14} />
                <span>Connect Database</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
