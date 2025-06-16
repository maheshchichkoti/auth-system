import { useLocation, useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const message = location.state?.message || 'An error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <ExclamationTriangleIcon className="mx-auto h-24 w-24 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops!</h1>
        <p className="text-lg text-gray-600 mb-8">{message}</p>

        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;