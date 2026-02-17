import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import CalendarView from './pages/CalendarView';
import Team from './pages/Team';
import SupervisorGroups from './pages/SupervisorGroups';

import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="team" element={<Team />} />
            <Route path="groups" element={<SupervisorGroups />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
