import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/Auth/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/chats');
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Мессенджер</h1>
          <p className="text-gray-600">Быстрое и безопасное общение</p>
        </div>
        
        <LoginForm />
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Ещё нет аккаунта?{' '}
            <button 
              onClick={() => navigate('/register')}
              className="text-primary-color font-medium hover:underline"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;