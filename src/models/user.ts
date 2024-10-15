export interface User {
  id: string;
  email: string;
  userType: "admin" | "user";
  name: string;
  profilePic?: string;
}
