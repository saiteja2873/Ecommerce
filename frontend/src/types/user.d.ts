export interface User {
  id: string;
  name?: string;
  email: string;
  password?: string;
  image?: string;
  phone?: string;
  provider?: string;
  role: "USER" | "ADMIN" | "MANAGER";
  createdAt: string;
  updatedAt: string;
}
