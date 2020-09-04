import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { authRequest } from "../types";
import { User } from "../models/User";

export const protect = async (
  req: authRequest,
  _: Response,
  next: NextFunction
) => {
  let token;

  //Check authorization head
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next({
      message: "You need to be logged in to visit this route",
      statusCode: 403,
    });
  }
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!!);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next({ message: `No user found for ID ${decoded.id}` });
    }

    //attach user to request
    req.user = user;
    next();
  } catch (err) {
    next({
      message: "You need to be logged in to visit this route",
      statusCode: 403,
    });
  }
};
