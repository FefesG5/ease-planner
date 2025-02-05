import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthContext } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner/Spinner";

const AuthHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAuthorized } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // If loading is done, user is null, and they are not on /signin,
    // redirect them to /signin
    if (!loading && !user && router.pathname !== "/signin") {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-[color:var(--body-text-color)]">
        <p className="text-lg">You must be logged in to access this page.</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-[color:var(--body-text-color)]">
        <p className="text-lg">You are not authorized to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthHandler;
