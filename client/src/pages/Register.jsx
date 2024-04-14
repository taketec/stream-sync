import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // For navigation
import { registerUser } from '../apis/auth'; // Assuming your register API function

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await registerUser({username,email,password}); // Get error from response
    if (data?.token) {
      localStorage.setItem("userToken", data.token);
      setIsLoading(false);
      navigate("/dashboard");
    } else {
      setIsLoading(false);
      if (error) {
        console.log(error)
        setErrorMessage(error); // Set error message if provided in response
      } else {
        setErrorMessage("Invalid Credentials!");
      }
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-3 rounded-lg bg-white ">
        <h1 className="text-2xl font-bold text-center">Register</h1>
        <p className='text-[#000000] text-[12px] tracking-wider font-medium'>Have Account ? <Link className='text-[rgba(0,195,154,1)] underline' to="/login">Sign in</Link></p>
        {errorMessage && <div className="text-red-500 text-center">{errorMessage}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="lastName"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
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
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <h1 className="text-xs text-center ">welcome to depth-map-gen</h1>  {/* Larger font size and specific color */}
      </div>
    </div>
  );
  };

  export default Register;