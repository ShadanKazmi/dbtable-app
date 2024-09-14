import './App.css'
import { PrimeReactProvider } from 'primereact/api';
import Table from './components/Table';

function App() {

  return (
    <PrimeReactProvider>
      <>
      <Table/>
      </>
    </PrimeReactProvider>
  )
}

export default App
