// import argon2 from "argon2";
import user from '../models/user.js';
import axios from "axios"
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await user.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: 'User already Exists' });
    const newuser = new user({ email, password,name: username });
    const token = await newuser.generateAuthToken();
    await newuser.save();
    res.json({ message: 'success', token: token });
  } catch (error) {
    console.log('Error in register ' + error);
    res.status(500).json({error:error});
  }
};
// export const login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const valid = await user.findOne({ email });
//     if (!valid) return res.status(404).json({ message: 'User does not exist' }); // Added return here

//     const validPassword = await argon2.verify(valid.password, password);
//     if (!validPassword) {
//       return res.status(401).json({ message: 'Invalid Credentials' }); // Added return here
//     }

//     const token = await valid.generateAuthToken();
//     await valid.save();
//     res.cookie('userToken', token, {
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000,
//     });
//     return res.status(200).json({ token: token, status: 200 }); // Added return here
//   } catch (error) {
//     return res.status(500).json({ error: error.message }); // Send only error message
//   }
// };


  export const validUser = async (req, res) => {
    try {
      const validuser = await user
        .findOne({ _id: req.userId })
        .select('-password');
      if (!validuser) res.json({ message: 'user is not valid' });
      res.status(201).json({
        user: validuser,
        token: req.token,
      });
    } catch (error) {
      res.status(500).json({ error: error });
      console.log(error);
    }
  };


  export const googleLogin = async (req,res) => {
    try {

      let { token } = req.body
      console.log(token)

      // the request below basically gives you a object like this
      // {
      //   [0]   sub: '797750419735279',
      //   [0]   name: 'Shendra Pandit',
      //   [0]   given_name: 'Shandra',
      //   [0]   family_name: 'Pandit',
      //   [0]   picture: 'https://lh3.googleusercontent.com/a/ACg8ocKOya8vf1PaL34inwDaw1gYkoeHV8MbUTPxOvCEw4EnuC5L0m-o=s96-c',
      //   [0]   email: 'shailupan93@gmail.com',
      //   [0]   email_verified: true,
      //   [0]   locale: 'en'
      //   [0] }
      //and then we use it to either make a user or to login a existing one, idk if its safe enough or not.
      //i asked chatgpt if its safe and it said yes

      axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
          "Authorization": `Bearer ${token}`
      }
    })
      .then(async response => {
        const username = response.data.name;
        const email = response.data.email;
        console.log(response.data)

        const existingUser = await user.findOne({ email });

        if (!existingUser) {
          console.log("user doesnt exist")
          const password = await jwt.sign(
            { username },
            process.env.SECRET,
            {
              expiresIn: '24h',
            }
          );
          console.log(password)
          const newuser = new user({ email, password,name: username });
          const token = await newuser.generateAuthToken();
          await newuser.save();
          return res.json({ message: 'success', token: token });
        }
        else{
          token = await existingUser.generateAuthToken()
          return res.json({ message: 'success', token: token });
        }
      })

    }
    catch(error){
      console.log(error)
    }
  }
  
  // export const logout = (req, res) => {
  //   req.rootUser.tokens = req.rootUser.tokens.filter((e) => e.token != req.token);
  // };

  export const searchUsers = async (req, res) => {
    // const { search } = req.query;
    const search = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};
  
    const users = await user.find(search).find({ _id: { $ne: req.userId } });
    res.status(200).send(users);
  };

  export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
      const selectedUser = await user.findOne({ _id: id }).select('-password');
      res.status(200).json(selectedUser);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  };
  
  export const updateInfo = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const updatedUser = await user.findByIdAndUpdate(id, { name });
    return updatedUser;
  };
  