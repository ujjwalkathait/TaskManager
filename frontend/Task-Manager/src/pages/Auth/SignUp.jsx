import React, { useContext, useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/Input';
import { Link, useNavigate } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import { UserContext } from '../../context/userContext';
import uploadImage from '../../utils/uploadImage';

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  
  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext); // Assuming UserContext is available
  const navigate = useNavigate();


  // Handle SignUp form submit
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    let profileImageUrl = '';

    if(!fullName) {
      setError("Please enter full name.");
      return;
    }

    if(!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if(!password) {
      setError("Password cannot be empty.");
      return;
      
    }

    setError("");

    // SignUp API call 
    try {

      // Upload image if selected
      if(profilePic) {
        /* Error due to imgUploadres.data */
        // const imgUploadRes = await uploadImage(profilePic);
        // profileImageUrl = imgUploadRes.data.imageUrl || '';
        try {
          const imgUploadRes = await uploadImage(profilePic);
          profileImageUrl = imgUploadRes.imageUrl || '';
          console.log('Image uploaded successfully:', profileImageUrl);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          setError("Failed to upload profile image");
          return;
        }
      }

      if (!profileImageUrl && fullName) {
        profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`;
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name : fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken
      });

      const {token, role} = response.data;

      if(token) {
        localStorage.setItem('token', token);
        updateUser(response.data);

        // Redirect based on role
        if(role === 'admin'){
          navigate('/admin/dashboard');
        }
        else {
          navigate('/user/dashboard');
        }
      }
    } catch (err) {
      if(err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };
  return (  
    <AuthLayout>
      <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-black'>Create an Account</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>
          Join us today by entering your details below.
        </p>


        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input 
              value={fullName}
              onChange={({target}) => setFullName(target.value)}  
              label="Full Name"
              placeholder="Enter your full name"
              type="text"
            />

            <Input
              value={email}
              onChange={({target}) => setEmail(target.value)}  
              label="Email Address"
              placeholder="Enter your email"
              type="text"
            />

            <Input
              value={password}
              onChange={({target}) => setPassword(target.value)}  
              label="Password"
              placeholder="Min 8 characters"
              type="password"
            />
            <Input
              value={adminInviteToken}
              onChange={({target}) => setAdminInviteToken(target.value)}  
              label="Admin Invite Token"
              placeholder="6 Digit Code"
              type="text"
            />
          </div>

          {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

          <button type='submit' className='btn-primary'>
            SIGN UP
          </button>

          <p className='text-[13px] text-slate-800 mt-3'>
            Already have an account?{" "}
            <Link className="font-medium text-primary underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp