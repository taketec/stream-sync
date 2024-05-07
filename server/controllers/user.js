import argon2 from "argon2";
import user from '../models/user.js';
import axios from "axios"


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
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const valid = await user.findOne({ email });
    if (!valid) return res.status(404).json({ message: 'User does not exist' }); // Added return here

    const validPassword = await argon2.verify(valid.password, password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid Credentials' }); // Added return here
    }

    const token = await valid.generateAuthToken();
    await valid.save();
    res.cookie('userToken', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ token: token, status: 200 }); // Added return here
  } catch (error) {
    return res.status(500).json({ error: error.message }); // Send only error message
  }
};


  export const validUser = async (req, res) => {
    try {
      const validuser = await user
        .findOne({ _id: req.rootUserId })
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
        console.log(existingUser)

        if (!existingUser) {
          const password = await argon2.hash(username+email,3)
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
  
  export const logout = (req, res) => {
    req.rootUser.tokens = req.rootUser.tokens.filter((e) => e.token != req.token);
  };

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
  
    const users = await user.find(search).find({ _id: { $ne: req.rootUserId } });
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
  