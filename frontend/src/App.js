import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './routes/login'
import { ChakraProvider } from '@chakra-ui/react'
import Menu from './routes/menu';
import { AuthProvider } from './context/useAuth';
import PrivateRoute from './components/private_route';
import Register from './routes/register';
function App() {
  return (
    <ChakraProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/' element={<PrivateRoute><Menu /></PrivateRoute>} />
          </Routes>
        </AuthProvider>
      </Router>
    </ChakraProvider>



  );
}

export default App;
