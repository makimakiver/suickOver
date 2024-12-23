import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="w-full bg-gray-800 text-white flex items-center p-4">
      <div className="flex-grow">
        <Link to="/" className="text-xl font-bold">
          Q&A Platform
        </Link>
      </div>
      <nav className="space-x-4">
        <Link to="/">Home</Link>
        <Link to="/ask">Ask Question</Link>
      </nav>
    </header>
  );
};

export default Header;
