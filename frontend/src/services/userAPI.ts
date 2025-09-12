import api from "./api";
import { User } from "../types/user";

export const userAPI = {
  list: async (): Promise<User[]> => {
    const { data } = await api.get("/users");
    return data.users as User[];
  },
  get: async (userId: string): Promise<User> => {
    const { data } = await api.get(`/users/${userId}`);
    return data.user as User;
  },
};
