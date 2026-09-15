

import { Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { FcPrivacy } from "react-icons/fc";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Page Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Settings
      </h2>

      {/* Settings Panel */}
      <div className="max-w-xl mx-auto space-y-4">
        {/* Reset Password Option */}
        <Link to="/student/settings/reset-password">
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg text-xl">
                <FcPrivacy />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-700">
                  Reset Password
                </h3>
                <p className="text-sm text-gray-500">
                  Secure your account credentials
                </p>
              </div>
            </div>
            <span className="text-gray-400">&gt;</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
