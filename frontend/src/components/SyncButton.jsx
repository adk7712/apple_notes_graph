
const SyncButton = ({ onSync, loading }) => {
  return (
    <button 
      onClick={onSync} 
      disabled={loading}
      className="sync-button"
    >
      {loading ? 'Syncing...' : 'Sync Notes'}
    </button>
  );
};

export default SyncButton;
