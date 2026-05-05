export function Timeline() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border-l-2 pl-4">
          <div className="h-3 w-1/3 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
