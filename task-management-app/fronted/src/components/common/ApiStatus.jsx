import { useState, useEffect } from 'react';

const ApiStatus = () => {
  const [status, setStatus] = useState('verificando...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch('https://app-task-backend.vercel.app/api/status');
        const data = await response.json();
        setStatus(`API: ${data.status}, DB: ${data.mongoStatus}`);
      } catch (err) {
        setError(`Error: ${err.message}`);
      }
    };
    
    checkApi();
  }, []);

  return (
    <div style={{padding: '10px', backgroundColor: error ? '#fee2e2' : '#ecfdf5', borderRadius: '4px', marginBottom: '10px'}}>
      {error ? error : `Estado de la API: ${status}`}
    </div>
  );
};

export default ApiStatus;