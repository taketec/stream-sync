import jwt from 'jsonwebtoken';
import user from '../models/user.js';

export const Auth = async (req, res, next) => {
  try {
    
    let token = req.headers.authorization.split(' ')[0]; //when using browser this line
      const verifiedUser = jwt.verify(token, process.env.SECRET);
      req.token = token;
      req.userId = verifiedUser.id

      // to get user data do this 
      // const rootUser = await user
      // .findOne({ _id: verifiedUser.id })
      // .select('-password');


    next();
  } catch (error) {
    // console.log(error);
    res.json({ error: 'Invalid Token' });
  }
};
