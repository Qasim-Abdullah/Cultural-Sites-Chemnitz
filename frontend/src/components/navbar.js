import { useState, useEffect } from "react";
import { ChevronDown, User, LogOut } from "lucide-react";
import { logout, getUserInfo, deleteUser } from "../routes/endpoints/api";
import { useNavigate } from "react-router-dom";


export default function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const nav = useNavigate();

    // Fetch user info when component mounts
    useEffect(() => {
        async function fetchUser() {
            try {
                const data = await getUserInfo();
                if (data) {
                    setUserData(data);
                }
            } catch (error) {
                console.error("Failed to fetch user info:", error);
            }
        }
        fetchUser();
    }, []);

    const handleViewProfile = () => {
        setIsDropdownOpen(false);
        setIsProfileOpen(true);
    };

    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            nav('/login');
        }
    };

    const handleDeleteUser = async () => {
        try {
            const result = await deleteUser();
            console.log('Delete result:', result);
            if (result) {
                alert('Account deleted successfully.');
                nav('/login'); // redirect to login page
            } else {
                alert('Failed to delete account.');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            alert('An error occurred while deleting the account.');
        }
    };


    return (
        <>
            <nav className="shadow-lg border-b"
                style={{
                    background: `linear-gradient(
      to bottom,
      #000 0%,
      #000 30%,
      #DD0000 36%,
      #DD0000 63%,
      #FFCC00 69%,
      #FFCC00 100%
    )`,
                }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold text-gray-800 bg-white"></h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative bg-white">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                >
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium"> {userData?.first_name || "Guest"}</span>
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                        <button
                                            onClick={handleViewProfile}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                                        >
                                            <User className="w-4 h-4 mr-3" />
                                            View Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isDropdownOpen && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                    />
                )}
            </nav>

            {/* Profile Modal */}
            {isProfileOpen && userData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">User Profile</h2>
                        <p><strong>First Name:</strong> {userData.first_name || "N/A"}</p>
                        <p><strong>Last Name:</strong> {userData.last_name || "N/A"}</p>
                        <p><strong>User Name:</strong> {userData.username || "N/A"}</p>
                        <p><strong>Email:</strong> {userData.email || "N/A"}</p>
                        <div className="mt-4 flex justify-between">
                            <button
                                onClick={() => setIsProfileOpen(false)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Close
                            </button>

                            <button
                                onClick={handleDeleteUser}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
