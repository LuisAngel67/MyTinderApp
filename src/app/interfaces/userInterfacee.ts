export interface IUser {
  uid: string;
  name: string;
  lastName: string;
  email: string;
  birthDate: string | Date;
  country?: string;
  city?: string;
  gender?: 'male' | 'female' | 'other';
  showGenderProfile?: boolean;
  passions?: { category: string }[];
  photos?: string[];
  createdAt?: string | Date;
}

export interface IAuth {
  email: string;
  password: string;
}

export interface IUserRegistration extends Omit<IUser, 'uid'> {
  password: string;
}

export type IUserFirestore = Omit<IUser, 'uid'>;
