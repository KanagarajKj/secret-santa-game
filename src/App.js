import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import SecretSantaApp from './components/SecretSantaApp';
import { Toaster } from 'react-hot-toast';
import EmployeeImport from './components/EmployeeImport ';

function App() {
  return (
    <>
    {/* <SecretSantaApp /> */}
    <EmployeeImport />
    <Toaster />
    </>
  );
}

export default App;
