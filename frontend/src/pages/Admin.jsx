import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import TopNav from "../components/learning/TopNav";
import UserTable from "../components/admin/UserTable";
import UserHistoryModal from "../components/admin/UserHistoryModal";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Search, Users, AlertCircle, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Admin() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ pagination (classic)
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [totalUsers, setTotalUsers] = useState(0);

  // ui state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const adminKey = useMemo(() => {
    return import.meta.env.VITE_ADMIN_KEY || localStorage.getItem("adminKey") || "";
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalUsers / usersPerPage));

  // auth checks
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/register");
      return;
    }

    if (!adminKey) {
      setError("Admin key is missing. Set VITE_ADMIN_KEY or localStorage adminKey.");
      setIsLoading(false);
      return;
    }
  }, [navigate, adminKey]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams();
      qs.set("page", String(currentPage));
      qs.set("pageSize", String(usersPerPage));
      if (searchQuery.trim()) qs.set("search", searchQuery.trim());

      const response = await fetch(
        `${API_BASE_URL}/api/admin/users?${qs.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-ADMIN-KEY": adminKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch users (${response.status})`);
      }

      const data = await response.json();

      setUsers(Array.isArray(data.items) ? data.items : []);
      setTotalUsers(
        Number(data.total ?? data.totalCount ?? data.Total ?? 0)
      );
    } catch (err) {
      setError(err.message || "Unknown error");
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, adminKey, currentPage, usersPerPage, searchQuery]);

  useEffect(() => {
    if (!adminKey) return;
    fetchUsers();
  }, [adminKey, fetchUsers]);

  const onSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Admin – Users</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by name, phone, or user ID..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {isLoading ? "Loading users..." : `${totalUsers} Users Found`}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
              </div>
            ) : (
              <>
                <UserTable
                  users={users}
                  onViewHistory={(u) => {
                    setSelectedUser(u);
                    setShowHistoryModal(true);
                  }}
                />

                {/* ✅ Classic Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedUser && (
        <UserHistoryModal
          user={selectedUser}
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}
