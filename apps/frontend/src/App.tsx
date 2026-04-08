import { useEffect, useState } from 'react';
import { HelloWorldPage } from './pages/HelloWorldPage';
import { FileUploaderPage } from './pages/FileUploaderPage';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return <HelloWorldPage />;
  }

  return <FileUploaderPage />;
}

