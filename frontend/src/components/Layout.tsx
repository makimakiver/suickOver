import React from "react";
import Header from "./Header";
import NavigationBar from "./NavigationBar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      <main className="flex-1 container mx-auto p-6">{children}</main>
      <footer className="w-full bg-gray-800 text-white p-4 text-center">
        © {new Date().getFullYear()} Q&A Platform
      </footer>
    </div>
  );
};

export default Layout;
