// components/admin/ui/AdminMessage.tsx

interface AdminMessageProps {
  type: "success" | "error";
  children: React.ReactNode;
}

export const AdminMessage: React.FC<AdminMessageProps> = ({ type, children }) => {
  return (
    <div
      className={`p-4 rounded-md text-sm ${
        type === "success"
          ? "bg-green-50 text-green-800"
          : "bg-red-50 text-red-800"
      }`}
    >
      {children}
    </div>
  );
};