import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { app } from "../../firebase.config";
import { useQuery } from "@tanstack/react-query";
import Router from "next/router";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthorized: boolean;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // Use React Query for checking if the user is authorized
  const { data: isAuthorized, isLoading: authLoading } = useQuery({
    queryKey: ["isAuthorized", user?.email],
    queryFn: async () => {
      if (user) {
        const usersRef = collection(db, "registered-users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
      }
      return false;
    },
    enabled: !!user, // Only run the query if a user is logged in
    staleTime: 5 * 60 * 1000, // Cache authorization check for 5 minutes
  });

  const signOutUser = async (): Promise<void> => {
    await auth.signOut();
    setUser(null);
    Router.push("/signin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || authLoading,
        isAuthorized: isAuthorized || false,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
