import { User } from "firebase/auth";
import Image from "next/image";
import SignOutButton from "../SignOutButton/SignOutButton";

interface UserSectionProps {
  user: User;
  signOutUser: () => Promise<void>;
}

const UserSection: React.FC<UserSectionProps> = ({ user, signOutUser }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-[var(--user-section-bg-color)] border-b border-gray-300 shadow-md">
      <div className="flex items-center space-x-4">
        <Image
          src={user.photoURL || "/user-icon.svg"}
          alt={`${user.displayName || "User"}'s profile`}
          width={50}
          height={50}
          className="rounded-full border-2 border-gray-300 shadow-sm"
        />
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-[var(--body-text-color)]">
            {user.displayName || "User"}
          </h3>
          <p className="text-sm text-[var(--body-text-color)]">{user.email}</p>
        </div>
      </div>
      <SignOutButton signOutUser={signOutUser} />
    </div>
  );
};

export default UserSection;
