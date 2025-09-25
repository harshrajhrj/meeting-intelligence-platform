// app/components/ErrorMessage.tsx

interface ErrorMessageProps {
  message: string | null;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;
  return (
    <div className="mt-8 text-center text-red-400 bg-red-900/50 p-4 rounded-md">
      {message}
    </div>
  );
};