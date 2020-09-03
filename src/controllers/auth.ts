import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { fullname, username, email, password } = req.body;

  try {
    const user = await User.create({ fullname, username, email, password });
    const token = user.getJwtToken();
    res.status(200).json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // get credentials
  const { email, password } = req.body;

  // verify not empty
  if (!email || !password) {
    next({
      message: "Please Provide email and password",
      statuscode: 400,
    });
  }

  //check if user exist
  const user = await User.findOne({ email });
  // No user found
  if (!user) {
    next({
      message: "Not yet registered",
      statuscode: 400,
    });
  }

  // if exist verify password
  const match = await user?.checkPassword(password);

  //if did not match
  if (!match) {
    return next({ message: "The password does not match", statusCode: 400 });
  }

  // get token
  const token = user?.getJwtToken();

  // then send json web token as response
  res.status(200).json({ success: true, token });
};
