import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BookOpen, LogOut, Phone, Shield } from "lucide-react";

// ✅ משתמשים ב-storage שלך (כמו שביקשת “לא לפגוע בדברים”)
import { clearUser, getUserName } from "../../utils/storage";

export default function TopNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isLearnPage = pathname === "/learn";

  // ✅ אותם שמות שמורים ב-localStorage אצלך
  const userName = getUserName() || "User";
  const userPhone = localStorage.getItem("userPhone") || "";

  const getInitials = (name) => {
    return String(name || "U")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    clearUser();
    navigate("/register", { replace: true });
  };

  const openAdminAuth = () => {
    // Learn.jsx יאזין לזה ויפתח modal
    window.dispatchEvent(new CustomEvent("open-admin-auth"));
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/learn" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50 group-hover:shadow-indigo-300/50 transition-shadow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-800 hidden sm:block">
              Learning Platform
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {/* ✅ במקום כפתור Learn שהיה - כפתור Admin רק ב-Learn */}
            {isLearnPage && (
              <Button
                variant="outline"
                onClick={openAdminAuth}
                className="border-slate-200 hover:bg-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}

            {/* אם את רוצה בעתיד כפתור חזרה ל-Learn מדפים אחרים - אפשר להחזיר */}
            {!isLearnPage && (
              <Link to="/learn">
                <Button
                  variant="ghost"
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                >
                  Learn
                </Button>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 h-auto py-2 px-3 hover:bg-slate-100"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-700">{userName}</p>
                  <p className="text-xs text-slate-400">{userPhone}</p>
                </div>

                <Avatar className="h-9 w-9 bg-gradient-to-br from-indigo-400 to-purple-500">
                  <AvatarFallback className="bg-transparent text-white text-sm font-medium">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 bg-white border-slate-200 shadow-xl"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-slate-800">{userName}</p>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {userPhone}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
