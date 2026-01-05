import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({ success: false, message: 'Not Authorized. Please login again.' });
  }

  try {
    const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = tokenDecoded.id;
    next();
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: 'Invalid token. Please login again.' });
  }
};

export default authUser;