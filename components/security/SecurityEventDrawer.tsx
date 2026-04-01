"use client";

export default function SecurityEventDrawer({ event, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end">
      <div className="w-[420px] bg-white h-full p-6 overflow-y-auto shadow-xl">
        <button
          className="text-gray-500 hover:text-gray-700 mb-4"
          onClick={onClose}
        >
          Close
        </button>

        <h2 className="text-xl font-semibold mb-4">Security Event</h2>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500">Type</div>
            <div className="font-medium">{event.type}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Severity</div>
            <div>{event.severity}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">User</div>
            <div>{event.user?.email ?? "Anonymous"}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">IP</div>
            <div>{event.ip ?? "-"}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Message</div>
            <div>{event.message}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Metadata</div>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(event.metadata ?? {}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}