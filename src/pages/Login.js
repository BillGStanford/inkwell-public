import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

 return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-sm shadow-lg border border-amber-200"
      >
        <div>
          <div className="flex justify-center">
            <BookOpenIcon className="h-16 w-16 text-amber-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-amber-900">INKWELL</h2>
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-amber-900">CURRENTLY UNDER WORK</h2>
          <p className="mt-2 text-center text-sm text-amber-700">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-sm shadow-sm space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className="w-full px-3 py-2 border border-amber-300 rounded-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                {...register("password", { required: "Password is required" })}
                className="w-full px-3 py-2 border border-amber-300 rounded-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-amber-800">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-amber-600 hover:text-amber-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Sign in'}
            </button>
          </div>
        </form>
        
        <p className="mt-4 text-center text-sm text-amber-700">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-amber-600 hover:text-amber-500">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;