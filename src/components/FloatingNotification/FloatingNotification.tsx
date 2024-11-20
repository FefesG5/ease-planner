interface FloatingNotificationProps {
  message: string;
  type: "success" | "error" | "info";
}

const FloatingNotification: React.FC<FloatingNotificationProps> = ({
  message,
  type,
}) => {
  if (!message) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 p-3 rounded-md shadow-md text-center w-[90%] max-w-md ${
        type === "success"
          ? "bg-green-100 text-green-700"
          : type === "error"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {message}
    </div>
  );
};

export default FloatingNotification;
