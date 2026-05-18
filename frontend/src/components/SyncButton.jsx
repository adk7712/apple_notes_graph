
const SyncButton = ({ onSync, loading }) => {
  return (
    <button 
      onClick={onSync} 
      disabled={loading}
      className="sync-button"
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          <span>Syncing...</span>
        </>
      ) : (
        'Sync Notes'
      )}
    </button>
  );
};

export default SyncButton;
