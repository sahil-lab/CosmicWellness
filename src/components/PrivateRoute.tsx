import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from 'firebase/auth';

interface PrivateRouteProps {
    user: User | null;
    children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ user, children }) => {
    if (!user) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
};

export default PrivateRoute; 