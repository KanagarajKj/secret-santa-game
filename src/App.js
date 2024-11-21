import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import SecretSantaApp from './components/SecretSantaApp';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
    <SecretSantaApp />
    <Toaster />
    </>
  );
}

export default App;
