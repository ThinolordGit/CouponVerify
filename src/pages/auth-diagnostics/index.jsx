import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Auth Diagnostics Page
 * Test endpoint to verify authentication flow and session persistence
 * Access at: /auth-test
 */
const AuthDiagnostics = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [results, setResults] = useState({
    api: null,
    login: null,
    check: null,
    cookies: null
  });
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const testApi = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/coupons`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      setResults(prev => ({
        ...prev,
        api: {
          success: response.ok,
          status: response.status,
          message: response.ok ? `✓ API OK (${data.data?.length || 0} coupons)` : `✗ Erreur ${response.status}`
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        api: { success: false, message: `✗ ${error.message}` }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('auth_user', JSON.stringify(data.data.user));
        setResults(prev => ({
          ...prev,
          login: {
            success: true,
            message: `✓ Connecté: ${data.data.user.username} (${data.data.user.role})`
          }
        }));
      } else {
        setResults(prev => ({
          ...prev,
          login: { success: false, message: `✗ ${response.status}: ${data.message}` }
        }));
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        login: { success: false, message: `✗ ${error.message}` }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testCheckAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/auth/check`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      const authenticated = data.data?.authenticated === true;

      setResults(prev => ({
        ...prev,
        check: {
          success: authenticated,
          message: authenticated
            ? `✓ Session valide: ${data.data.user?.username}`
            : '✗ Pas de session active'
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        check: { success: false, message: `✗ ${error.message}` }
      }));
    } finally {
      setLoading(false);
    }
  };

  const checkCookies = () => {
    const cookies = document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(c => c);

    const authUser = localStorage.getItem('auth_user');

    setResults(prev => ({
      ...prev,
      cookies: {
        success: cookies.length > 0 || !!authUser,
        cookies: cookies,
        localStorage: !!authUser
      }
    }));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ background: '#f0f4f8', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h1>🔐 Diagnostics d'Authentification</h1>
        <p style={{ color: '#666', marginTop: '10px' }}>
          ℹ️ Page de test pour vérifier l'authentification admin dans le frontend React
        </p>

        <div style={{ marginTop: '20px', padding: '10px', background: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
          <p><strong>Backend API:</strong> <code>{API_URL}</code></p>
          <p><strong>Frontend URL:</strong> <code>{window.location.origin}</code></p>
        </div>
      </div>

      {/* Test Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={testApi}
          disabled={loading}
          style={{
            padding: '10px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test API
        </button>
        <button
          onClick={testLogin}
          disabled={loading}
          style={{
            padding: '10px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Login
        </button>
        <button
          onClick={testCheckAuth}
          disabled={loading}
          style={{
            padding: '10px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Vérifier Session
        </button>
        <button
          onClick={checkCookies}
          disabled={loading}
          style={{
            padding: '10px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Afficher Cookies
        </button>
      </div>

      {/* Results */}
      {results.api && (
        <div style={{
          padding: '12px',
          marginBottom: '10px',
          borderRadius: '4px',
          background: results.api.success ? '#d4edda' : '#f8d7da',
          color: results.api.success ? '#155724' : '#721c24',
          border: `1px solid ${results.api.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <strong>API:</strong> {results.api.message}
        </div>
      )}

      {results.login && (
        <div style={{
          padding: '12px',
          marginBottom: '10px',
          borderRadius: '4px',
          background: results.login.success ? '#d4edda' : '#f8d7da',
          color: results.login.success ? '#155724' : '#721c24',
          border: `1px solid ${results.login.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <strong>Login:</strong> {results.login.message}
        </div>
      )}

      {results.check && (
        <div style={{
          padding: '12px',
          marginBottom: '10px',
          borderRadius: '4px',
          background: results.check.success ? '#d4edda' : '#d1ecf1',
          color: results.check.success ? '#155724' : '#0c5460',
          border: `1px solid ${results.check.success ? '#c3e6cb' : '#bee5eb'}`
        }}>
          <strong>Session:</strong> {results.check.message}
        </div>
      )}

      {results.cookies && (
        <div style={{
          padding: '12px',
          marginBottom: '10px',
          borderRadius: '4px',
          background: '#d1ecf1',
          color: '#0c5460',
          border: '1px solid #bee5eb'
        }}>
          <strong>Stockage:</strong>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            {results.cookies.cookies.length > 0 ? (
              results.cookies.cookies.map((cookie, i) => (
                <li key={i} style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  {cookie.split('=')[0]} = {cookie.split('=')[1]?.substring(0, 20)}...
                </li>
              ))
            ) : (
              <li>Aucun cookie</li>
            )}
            <li style={{ marginTop: '8px', fontWeight: 'bold' }}>
              {results.cookies.localStorage ? '✓ LocalStorage: auth_user' : '✗ Pas de auth_user en localStorage'}
            </li>
          </ul>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#e7f3ff',
        borderLeft: '4px solid #2196F3',
        borderRadius: '4px'
      }}>
        <h3>📖 Instructions</h3>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Clique sur <strong>"Test API"</strong> pour vérifier la connexion au backend</li>
          <li>Clique sur <strong>"Test Login"</strong> pour te connecter avec admin:admin123</li>
          <li>Clique sur <strong>"Vérifier Session"</strong> pour confirmer que la session persiste</li>
          <li>Clique sur <strong>"Afficher Cookies"</strong> pour voir les données stockées</li>
          <li>Si tous les tests passent, va à <strong><a href="/admin-login">Admin Login Page</a></strong></li>
        </ol>
      </div>

      {/* Navigation */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => navigate('/admin-login')}
          style={{
            padding: '10px 20px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Aller au Login
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retour Accueil
        </button>
      </div>
    </div>
  );
};

export default AuthDiagnostics;
