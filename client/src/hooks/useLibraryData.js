import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const useLibraryData = () => {
  const { user, token } = useAuth();
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBooks = useCallback(async () => {
    if (!token) return;
    const { data } = await api.get('/books');
    setBooks(data);
  }, [token]);

  const fetchIssues = useCallback(async () => {
    if (!token || !user) return;
    const endpoint = user.role === 'admin' ? '/issues' : '/issues/my';
    const { data } = await api.get(endpoint);
    setIssues(data);
  }, [token, user]);

  const refresh = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    setError('');
    try {
      await Promise.all([fetchBooks(), fetchIssues()]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load library data');
    } finally {
      setLoading(false);
    }
  }, [fetchBooks, fetchIssues, token, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { books, issues, loading, error, refresh, setBooks, setIssues };
};
