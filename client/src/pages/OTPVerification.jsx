import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const email = location.state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  // Auto-submit when 6 digits are entered
  const otpValue = watch('otp');
  useEffect(() => {
    if (otpValue?.length === 6) {
      handleSubmit(onSubmit)();
    }
  }, [otpValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authService.verifyOTP({
        email,
        otp: data.otp,
      });

      toast.success('Login successful!');
      login(response.user);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setCanResend(false);
      setResendTimer(60);

      await authService.login({ email, password: location.state?.password });
      toast.success('New OTP sent to your email');

      // Restart timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      toast.error('Failed to resend OTP');
      setCanResend(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Identity
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a 6-digit code to {email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Enter OTP
            </label>
            <input
              {...register('otp', {
                required: 'OTP is required',
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'OTP must be 6 digits',
                },
              })}
              type="text"
              maxLength="6"
              autoComplete="one-time-code"
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-center text-2xl tracking-widest"
              placeholder="000000"
              autoFocus
            />
            {errors.otp && (
              <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>

          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend OTP in {resendTimer} seconds
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;