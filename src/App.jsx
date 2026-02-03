import { Routes, Route } from 'react-router'
import { LoginPage } from './pages/loginpage/LoginPage'
import { HomePage } from './pages/HomePage/HomePage';
import { ViewAgents } from './pages/ViewAgents/viewagents';
import { CreateNewPage } from './pages/CreateNewPage/CreateNewPage';
import { ViewDetails } from './pages/ViewDetails/ViewDetails';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path='/' element={<LoginPage />} />
      <Route path='/homepage' element={<HomePage />} />
      <Route path='/homepage/viewagents' element={<ViewAgents />} />
      <Route path='/homepage/createnewpage' element={<CreateNewPage />} />
      <Route path='/homepage/viewdetails/:id' element={<ViewDetails />} />
    </Routes>
  );
}

export default App
