interface Props {
  message?: string;
  type?: 'success' | 'error';
}

export default function Alert({ message, type = 'error' }: Props) {
  if (!message) return null;
  return (
    <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${
      type === 'success'
        ? 'bg-green-50 text-green-800 border border-green-200'
        : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      {message}
    </div>
  );
}
