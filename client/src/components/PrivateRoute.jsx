import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const token = localStorage.getItem('token');
    console.log("PrivateRoute Check - Token:", token); // DEBUG

    const isAuthenticated = token && token !== 'undefined' && token !== 'null';

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
