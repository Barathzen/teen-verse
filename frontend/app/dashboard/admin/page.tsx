"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Loading, Error } from "@/components/common/Loading";
import { adminService } from "@/services/index";
import { User } from "@/types/api";

export default function AdminPortalPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminService.listUsers();
        setUsers(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleToggle = async (user: User) => {
    setPendingUserId(user.id);
    setError(null);
    try {
      const nextRole = user.role === "admin" ? "user" : "admin";
      const updated = await adminService.updateUserRole(user.id, nextRole);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to update role");
    } finally {
      setPendingUserId(null);
    }
  };

  if (isLoading) return <Loading message="Loading admin portal..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
        <p className="text-gray-600 mt-1">Manage user access and roles</p>
      </div>

      {error && <Error message={error} onDismiss={() => setError(null)} />}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-4 pr-4 font-medium text-gray-900">{user.name}</td>
                  <td className="py-4 pr-4 text-gray-600">{user.email}</td>
                  <td className="py-4 pr-4">
                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <Button
                      variant={user.role === "admin" ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleRoleToggle(user)}
                      disabled={pendingUserId === user.id}
                    >
                      {user.role === "admin" ? "Revoke Admin" : "Make Admin"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
