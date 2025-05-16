export interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface UserDataPort {
  getUserData: () => Promise<UserData>;
}
