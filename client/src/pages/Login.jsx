
import React, { useState, useEffect } from 'react';
import { Link,useNavigate } from 'react-router-dom'; // For navigation after login
import { loginUser, validUser ,googleLoginUser} from '../apis/auth';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
    const navigate = useNavigate();
  
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const token = localStorage.getItem('userToken');

          if (token) {
            const response = await validUser();
            if (response.token) {
              navigate('/room/123'); // Replace with your dashboard route
            } else {
              localStorage.removeItem('userToken'); // Clear invalid token
            }
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
        }
      };
  
      checkAuth();
    }, []); // Run only on component mount

    const googleLogin = useGoogleLogin({

      onSuccess: async(tokenResponse) => {
        try{
          console.log('Google login successful', tokenResponse.access_token);

          const response = await googleLoginUser({token:tokenResponse.access_token})
          let token = response.data.token
          localStorage.setItem('userToken', token);
          navigate('/room/123'); 
        } 
        catch(error){
          setErrorMessage(error.response?.data?.message || 'Login failed')
        }
      },
  
      onError: () => {
        setErrorMessage('Google login faiied')
        console.error('Google login failed');
      }  
    });
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      setIsLoading(true);
      setErrorMessage(null);
  
      try {
        const response = await loginUser({ email, password });
        const token = response.data.token; // Assuming token is in response data
  
        localStorage.setItem('userToken', token);
        navigate('/room/123'); // Replace with your room route
      } catch (error) {
        console.error('Login error:', error);
        setErrorMessage(error.response?.data?.message || 'Login failed');
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-3 rounded-lg bg-white ">
          <h1 className="text-2xl font-bold text-center">Login</h1>
          <p className='text-[#000000] text-[12px] tracking-wider font-medium'>No Account ? <Link className='text-[rgba(0,195,154,1)] underline' to="/register">Sign up</Link></p>
          {errorMessage && <div className="text-red-500 text-center">{errorMessage}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-3 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-700 ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <button onClick={() => googleLogin()}>

            Sign in with Google 🚀

          </button>

          <div className="flex justify-center mt-8">  {/* Added mt-8 for margin-top */}
            <h1 className="text-xs text-center ">welcome to streamsync 📺</h1>
          </div>        
        </div>
      </div>
    );
  };
  
  export default Login;