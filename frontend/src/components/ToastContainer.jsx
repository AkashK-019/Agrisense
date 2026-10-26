import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import '../styles/ToastContainer.css';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-fixed-container">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 style={{ width: '20px', height: '20px', color: '#059669', flexShrink: 0 }} />,
          warning: <AlertTriangle style={{ width: '20px', height: '20px', color: '#d97706', flexShrink: 0 }} />,
          error: <AlertCircle style={{ width: '20px', height: '20px', color: '#e11d48', flexShrink: 0 }} />,
          info: <Info style={{ width: '20px', height: '20px', color: '#0284c7', flexShrink: 0 }} />
        };

        return (
          <div
            key={toast.id}
            className={`toast-item ${toast.type || 'success'}`}
          >
            <div className="toast-left">
              {icons[toast.type] || icons.success}
              <p className="toast-message">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close-btn"
              aria-label="Close notification"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;