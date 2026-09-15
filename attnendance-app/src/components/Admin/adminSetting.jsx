

import { Link } from "react-router-dom";
import { HiUserCircle, HiKey, HiChevronRight } from "react-icons/hi";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";

// A professional-looking skeleton loader component
const LoadingSkeleton = () => (
    <div className="max-w-3xl mx-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="h-10 bg-slate-200 rounded-md w-1/3 mx-auto mb-4"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/2 mx-auto mb-12"></div>

        {/* Profile Card Skeleton */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 flex items-center gap-4">
            <div className="h-16 w-16 bg-slate-200 rounded-full"></div>
            <div className="flex-1 space-y-3">
                <div className="h-5 bg-slate-200 rounded-md w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded-md w-2/4"></div>
            </div>
        </div>

        {/* Settings Link Skeleton */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="h-12 w-12 bg-slate-200 rounded-lg"></div>
            <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-200 rounded-md w-1/5"></div>
                <div className="h-3 bg-slate-200 rounded-md w-2/5"></div>
            </div>
        </div>
    </div>
);

export default function Setting() {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const email = localStorage.getItem("email");

    useEffect(() => {
        if (!email) {
            setError("No email found in local storage.");
            setLoading(false);
            return;
        }

        apiFetch(`/admin_details/${email}`)
            .then((data) => {
                setAdminData(data);
                setError(null);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to fetch your details. Please try again later.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [email]); // Dependency array ensures this runs if email changes

    const renderContent = () => {
        if (loading) {
            return <LoadingSkeleton />;
        }

        if (error) {
            return (
                <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg">
                    <h3 className="font-semibold">An Error Occurred</h3>
                    <p>{error}</p>
                </div>
            );
        }

        if (adminData) {
            return (
                <>
                    {/* Account Information Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-10">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                                <HiUserCircle className="h-10 w-10 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{adminData.name}</h2>
                                <p className="text-slate-600">{adminData.email}</p>
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-indigo-800 bg-indigo-100 rounded-full">
                                    {adminData.department} ({adminData.name_code})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                            Security
                        </h3>
                        <Link to="/admin/settings/reset-password" className="block">
                            <div className="group flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-indigo-300 hover:scale-[1.02]">
                                <div className="flex items-center gap-5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                                        <HiKey className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">
                                            Reset Password
                                        </h4>
                                        <p className="text-sm text-slate-500">
                                            Secure your account by changing your password.
                                        </p>
                                    </div>
                                </div>
                                <HiChevronRight className="h-6 w-6 text-slate-400 transition-transform duration-300 group-hover:translate-x-1" />
                            </div>
                        </Link>
                        {/* You can add more setting links here following the same pattern */}
                    </div>
                </>
            );
        }

        return null; // Render nothing if there's no data, loading, or error
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <main className="container mx-auto px-4 py-12">
                {/* Page Header */}
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
                        Settings
                    </h1>
                    <p className="mt-3 text-lg text-slate-600">
                        Manage your account profile and security preferences.
                    </p>
                </header>
                
                <div className="max-w-3xl mx-auto">
                   {renderContent()}
                </div>
            </main>
        </div>
    );
}