const Spinner = () => {
  return (
    <div className="fixed top-[20%] left-1/2 transform -translate-x-1/2 w-full h-0 flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-solid rounded-full border-t-[var(--spinnner-border-left-color)] border-gray-300 animate-spin border-t-[var(--spinnner-border-left-color)]"></div>
    </div>
  );
};

export default Spinner;
