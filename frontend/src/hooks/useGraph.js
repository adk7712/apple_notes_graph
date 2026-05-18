import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';

export const useGraph = () => {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGraph = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/graph');
      setGraphData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch graph data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncGraph = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/sync');
      setGraphData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to sync graph');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGraph();
  }, [fetchGraph]);

  return { graphData, loading, error, syncGraph, fetchGraph };
};
