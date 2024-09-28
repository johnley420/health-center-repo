import { Button, Image, Input, Link, Checkbox } from '@nextui-org/react';
import React, { useState } from 'react';

const Login = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptedTerms(e.target.checked);
  };

  return (
    <div className="flex flex-col md:flex-row flex-wrap h-screen">
      {/* Left Side: Login Form */}
      <div className="flex flex-col justify-top items-center w-full md:w-1/2 p-6">
        <div className="w-full md:w-[70%] flex flex-col justify-between h-full p-6 pb-0">
          <div className="w-full">
            <h1 className="mb-2 text-4xl font-medium">Get Started Now</h1>
            <p>Enter your credentials to access your account</p>
          </div>
          <div>
            {/* Email Address Input */}
            <Input
              label="Email Address"
              labelPlacement="outside"
              placeholder="Enter your username"
              className="mb-12"
            />

            {/* Flex Container for Password Label and Forgot Password Link */}
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Password</label>
              <Link color="primary" href="/forgot-password" className="text-sm">
                Forgot Password?
              </Link>
            </div>

            {/* Password Input */}
            <Input
              placeholder="Enter your password"
              type="password"
              className="mb-4"
            />

            {/* Terms and Privacy Policy */}
            <div className="flex items-start space-x-2 mb-6">
              <Checkbox
                aria-label="Accept terms"
                checked={acceptedTerms}
                onChange={handleTermsChange}
              />
              <p className="text-sm text-gray-600">
                By signing in, you agree to our{' '}
                <Link color="primary" href="/terms">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link color="primary" href="/privacy">
                  Privacy Policy
                </Link>.
              </p>
            </div>

            {/* Disable button if terms are not accepted */}
            <Button
              className="w-full"
              color="primary"
              disabled={!acceptedTerms}
            >
              Sign In
            </Button>

            <p className="text-center mt-4">
              Haven't had an account?{' '}
              <Link color="primary" href="/signup">
                Sign up
              </Link>
            </p>
          </div>
          <p className="w-full text-center mt-8 md:mt-0">© 2024 Active, All Rights Reserved</p>
        </div>
      </div>

      {/* Right Side: Logo/Image */}
      <div className="hidden md:flex md:w-1/2 p-4 md:p-8">
        <div className="bg-sky-600 flex flex-col w-full justify-top gap-8 md:gap-12 pt-12 md:pt-24 items-center rounded-[26px] p-8 md:pl-28">
          <div className="text-3xl md:text-4xl text-white font-medium w-full text-center md:text-left">
            <p>The simplest way to manage</p>
            <p>your workforce</p>
            <p className="w-full text-md md:text-lg text-white mt-4">
              Enter your credentials to access your account
            </p>
          </div>

          <Image
            src="/public/tablesample.png"
            alt="Logo"
            className="object-fill w-[50%] md:w-[75%] shadow-md h-[300px] md:h-[500px]"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
