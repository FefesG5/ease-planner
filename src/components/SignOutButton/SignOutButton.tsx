interface SignOutButtonProps {
  signOutUser: () => Promise<void>;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ signOutUser }) => {
  return (
    <button
      onClick={signOutUser}
      className="bg-[var(--signin-btn-bg-color)] text-[var(--signin-text-color)] border-none py-2 px-4 md:py-3 md:px-6 text-sm md:text-base font-bold rounded-lg cursor-pointer transition-colors duration-300 ease-in-out hover:bg-[var(--signin-btn-hover-bg-color)]"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
