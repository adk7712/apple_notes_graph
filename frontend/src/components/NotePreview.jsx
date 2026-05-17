import { useState, useEffect } from 'react';
import apiClient from '../api';
import axios from 'axios';

const NotePreview = ({ noteId, onClose }) => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!noteId) return;

    const abortController = new AbortController();

    const fetchNote = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/notes/${noteId}`, {
          signal: abortController.signal
        });
        setNote(response.data);
        setError(null);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError('Failed to fetch note content');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNote();

    return () => {
      abortController.abort();
    };
  }, [noteId]);

  if (!noteId) return null;

  return (
    <div className="note-preview">
      <div className="note-preview-header">
        <button onClick={onClose}>Close</button>
      </div>
      {loading && <p>Loading note...</p>}
      {error && <p className="error">{error}</p>}
      {note && (
        <div className="note-content">
          <h2>{note.name}</h2>
          <div className="note-body">
            {note.clean_body || note.body || 'No content available'}
          </div>
          <div className="note-metadata">
            <p>ID: {note.note_id}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotePreview;
