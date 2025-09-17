import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Quotes from './pages/Quotes';
import Tours from './pages/Tours';
import Bookings from './pages/Bookings';
import OvernightLists from './pages/OvernightLists';
import Checklists from './pages/Checklists';
import Invoices from './pages/Invoices';
import Suppliers from './pages/Suppliers';
import Agents from './pages/Agents';
import Reports from './pages/Reports';

// Styles
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Navbar />
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/tours" element={<Tours />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/overnight-lists" element={<OvernightLists />} />
                <Route path="/checklists" element={<Checklists />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </main>
          </div>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
