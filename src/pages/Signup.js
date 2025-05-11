import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await signup(data.username, data.email, data.password, data.bio);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
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
          <p className="mt-2 text-center text-sm text-amber-700">
            Create your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-sm shadow-sm space-y-4">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                {...register("username", { 
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters"
                  }
                })}
                className="w-full px-3 py-2 border border-amber-300 rounded-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Username"
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
            </div>
            
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
              <textarea
                id="bio"
                name="bio"
                {...register("bio")}
                className="w-full px-3 py-2 border border-amber-300 rounded-sm focus:ring-amber-500 focus:border-amber-500 h-24"
                placeholder="Tell us about yourself (optional)"
              />
            </div>
            
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
                className="w-full px-3 py-2 border border-amber-300 rounded-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
            
            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match"
                })}
                className="w-full px-3 py-2 border border-amber-300 rounded-sm focus:ring-amber-500 focus:border-amber-500"
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
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
              ) : 'Create Account'}
            </button>
          </div>
        </form>
        
        <p className="mt-4 text-center text-sm text-amber-700">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-amber-600 hover:text-amber-500">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;