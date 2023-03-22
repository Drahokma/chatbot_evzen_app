import mongoose, { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface IUserDocument extends Document {
  _id: string | ObjectId;
  authId: string | ObjectId;
  username?: string;
  email?: string;
  password?: string;
  avatarColor?: string;
  uId?: string;
  createdAt?: Date;
}

export interface IResetPasswordParams {
  username: string;
  email: string;
  ipaddress: string;
  date: string;
}


export interface ISearchUser {
  _id: string;
  username: string;
  email: string;
  avatarColor: string;
}

export interface ILogin {
  userId: string;
}

export interface IAllUsers {
  users: IUserDocument[];
  totalUsers: number;
}
