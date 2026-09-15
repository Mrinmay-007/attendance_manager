// import { useNavigate } from "react-router-dom";
// import { FaSignOutAlt } from "react-icons/fa";

// export default function Logout() {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.clear();
//     sessionStorage.clear();
//     navigate("/");
//   };

//   return (
//     <>
//       <button
//         onClick={handleLogout}
//         className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 px-5 py-2 rounded-lg shadow-md transition-all duration-200"
//       >
//         <FaSignOutAlt /> Logout
//       </button>
//     </>
//   );
// }





import { useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
 
    console.log("User logged out.");
    
    // Clear user session from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors duration-300"
      aria-label="Logout"
    >
      <HiOutlineLogout className="h-5 w-5" />
      <span>Logout</span>
    </button>
  );
}