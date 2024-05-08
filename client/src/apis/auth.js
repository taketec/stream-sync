import axios from 'axios';


const API = (token) =>
  axios.create({
    baseURL: 'https://stream-sync-server-ka811t264-taketecs-projects.vercel.app',
    headers: { Authorization: token },
  });


let url = 'https://stream-sync-server-ka811t264-taketecs-projects.vercel.app';

// export const loginUser = async (body) => {
//   try {
//     return await axios.post(`${url}/auth/login`, body);
//   } catch (error) {
//     console.log('error in loginuser api');
//   }
// };

export const googleLoginUser = async (body) => {
  try {
    return await axios.post(`${url}/auth/google`, body);
  } catch (error) {
    console.log('error in google-loginuser api');
  }
};


// export const registerUser = async (body) => {
//   try {
//     return await axios.post(`${url}/auth/register`, body);
    
//   } catch (error) {
//     if (error.response && error.response.data && error.response.data.error) {
//       return { error: error.response.data.error };
//     } else {
//       return { error: "An unexpected error occurred." };
//     }
//   }
// };
export const validUser = async () => {
  try {
    const token = localStorage.getItem('userToken');

    const { data } = await API(token).get(`/auth/valid`, {
      headers: { Authorization: token },
    });
    return data;
  } catch (error) {
    console.log('error in valid user api');
  }
};
