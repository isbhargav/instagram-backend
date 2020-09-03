import { Request } from "express";
import { IUser } from "./models/User";
export type authRequest = Request & { user?: IUser };
