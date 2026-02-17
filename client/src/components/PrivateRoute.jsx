import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const token = localStorage.getItem('token');

    // Simple check. For more robust auth, we might want to validate the token with the backend 
    // or check a global auth state, but checking presence is a good first step.

    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
