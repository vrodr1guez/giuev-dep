/// <reference path="../../types/react.d.ts" />
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  User, UserPlus, Users, Shield, Edit, Trash, Search, 
  MoreHorizontal, X, Check, RefreshCw, Filter
} from 'lucide-react';

// Type definitions
interface UserModel {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  permissions: string[];
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([] as string[]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Mock data for users
  const users: UserModel[] = [
    {
      id: 'user-1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'Administrator',
      isActive: true,
      lastLogin: '2024-05-15T10:30:00Z',
      createdAt: '2023-01-15T09:00:00Z',
      permissions: ['all'],
      avatar: 'JS'
    },
    {
      id: 'user-2',
      name: 'Emily Chen',
      email: 'emily.chen@example.com',
      role: 'Fleet Manager',
      isActive: true,
      lastLogin: '2024-05-14T15:45:00Z',
      createdAt: '2023-02-20T11:20:00Z',
      permissions: ['vehicles:read', 'vehicles:write', 'charging:read', 'charging:write', 'routes:read', 'routes:write', 'reports:read']
    },
    {
      id: 'user-3',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      role: 'Driver Supervisor',
      isActive: true,
      lastLogin: '2024-05-13T09:15:00Z',
      createdAt: '2023-03-10T14:30:00Z',
      permissions: ['vehicles:read', 'drivers:read', 'drivers:write', 'routes:read', 'reports:read']
    },
    {
      id: 'user-4',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'Charging Manager',
      isActive: true,
      lastLogin: '2024-05-12T16:20:00Z',
      createdAt: '2023-04-05T10:45:00Z',
      permissions: ['charging:read', 'charging:write', 'vehicles:read', 'reports:read']
    },
    {
      id: 'user-5',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      role: 'Read Only',
      isActive: false,
      lastLogin: '2024-04-20T11:10:00Z',
      createdAt: '2023-05-15T09:30:00Z',
      permissions: ['vehicles:read', 'charging:read', 'routes:read', 'reports:read']
    }
  ];

  // Mock data for roles
  const roles: Role[] = [
    {
      id: 'role-1',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: ['all'],
      userCount: 1
    },
    {
      id: 'role-2',
      name: 'Fleet Manager',
      description: 'Manages vehicles, charging, and routes',
      permissions: ['vehicles:read', 'vehicles:write', 'charging:read', 'charging:write', 'routes:read', 'routes:write', 'reports:read'],
      userCount: 1
    },
    {
      id: 'role-3',
      name: 'Driver Supervisor',
      description: 'Manages drivers and views vehicle information',
      permissions: ['vehicles:read', 'drivers:read', 'drivers:write', 'routes:read', 'reports:read'],
      userCount: 1
    },
    {
      id: 'role-4',
      name: 'Charging Manager',
      description: 'Manages charging infrastructure',
      permissions: ['charging:read', 'charging:write', 'vehicles:read', 'reports:read'],
      userCount: 1
    },
    {
      id: 'role-5',
      name: 'Read Only',
      description: 'View-only access to system data',
      permissions: ['vehicles:read', 'charging:read', 'routes:read', 'reports:read'],
      userCount: 1
    }
  ];

  // Mock data for permissions
  const permissions: Permission[] = [
    { id: 'perm-1', name: 'vehicles:read', description: 'View vehicle information', category: 'Vehicles' },
    { id: 'perm-2', name: 'vehicles:write', description: 'Modify vehicle information', category: 'Vehicles' },
    { id: 'perm-3', name: 'charging:read', description: 'View charging information', category: 'Charging' },
    { id: 'perm-4', name: 'charging:write', description: 'Modify charging information', category: 'Charging' },
    { id: 'perm-5', name: 'routes:read', description: 'View routes', category: 'Routes' },
    { id: 'perm-6', name: 'routes:write', description: 'Create and modify routes', category: 'Routes' },
    { id: 'perm-7', name: 'drivers:read', description: 'View driver information', category: 'Drivers' },
    { id: 'perm-8', name: 'drivers:write', description: 'Modify driver information', category: 'Drivers' },
    { id: 'perm-9', name: 'reports:read', description: 'View reports', category: 'Reports' },
    { id: 'perm-10', name: 'reports:write', description: 'Create reports', category: 'Reports' },
    { id: 'perm-11', name: 'settings:read', description: 'View system settings', category: 'Settings' },
    { id: 'perm-12', name: 'settings:write', description: 'Modify system settings', category: 'Settings' },
    { id: 'perm-13', name: 'all', description: 'All permissions', category: 'System' },
  ];

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to toggle user selection
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Simulate loading users
  const refreshUsers = () => {
    setUsersLoading(true);
    setTimeout(() => {
      setUsersLoading(false);
    }, 1000);
  };

  // Simulate loading roles
  const refreshRoles = () => {
    setRolesLoading(true);
    setTimeout(() => {
      setRolesLoading(false);
    }, 1000);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setIsAddUserModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Roles & Permissions
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="users" className="mt-0">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search users by name, email, or role..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refreshUsers}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex items-center justify-between bg-blue-50 p-2 rounded-md mb-4">
                <span className="text-sm">{selectedUsers.length} users selected</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUsers([])}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {usersLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="p-3 font-medium w-8">
                        <input 
                          type="checkbox"
                          className="rounded"
                          checked={selectedUsers.length === users.length}
                          onChange={() => {
                            if (selectedUsers.length === users.length) {
                              setSelectedUsers([]);
                            } else {
                              setSelectedUsers(users.map(user => user.id));
                            }
                          }}
                        />
                      </th>
                      <th className="p-3 font-medium">User</th>
                      <th className="p-3 font-medium">Role</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Last Login</th>
                      <th className="p-3 font-medium">Created</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <input 
                            type="checkbox"
                            className="rounded"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                              {user.avatar || getInitials(user.name)}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-gray-500 text-xs">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{user.role}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500">{formatDate(user.lastLogin)}</td>
                        <td className="p-3 text-gray-500">{formatDate(user.createdAt)}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button className="p-1 text-gray-500 hover:text-blue-600">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-500 hover:text-red-600">
                              <Trash className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-500 hover:text-gray-700">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredUsers.length === 0 && !usersLoading && (
              <div className="text-center py-8 text-gray-500">
                No users matching your search
              </div>
            )}
          </TabsContent>

          <TabsContent value="roles" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">System Roles</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refreshRoles}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${rolesLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setIsEditRoleModalOpen(true)}>
                  <Shield className="h-4 w-4 mr-2" />
                  New Role
                </Button>
              </div>
            </div>

            {rolesLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {roles.map(role => (
                  <Card key={role.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{role.name}</h4>
                          <p className="text-sm text-gray-500">{role.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          {role.name !== 'Administrator' && (
                            <Button variant="ghost" size="sm">
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                          <span>Permissions</span>
                          <span>{role.userCount} user{role.userCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map(perm => {
                            const permission = permissions.find(p => p.name === perm);
                            return (
                              <div 
                                key={perm}
                                className="px-2 py-1 bg-gray-100 rounded-full text-xs flex items-center"
                              >
                                {perm === 'all' ? (
                                  <>
                                    <Check className="h-3 w-3 text-green-500 mr-1" />
                                    <span>All Permissions</span>
                                  </>
                                ) : (
                                  <span>{permission?.category}: {perm.split(':')[1]}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Card>

      {/* More info cards can be added here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users (Last 24h)</span>
                <span className="font-bold">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users (Last 7d)</span>
                <span className="font-bold">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Inactive Users</span>
                <span className="font-bold">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Failed Login Attempts (24h)</span>
                <span className="font-bold">2</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Permission Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Roles</span>
                <span className="font-bold">{roles.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Permissions</span>
                <span className="font-bold">{permissions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Users with Admin Access</span>
                <span className="font-bold">{users.filter(user => user.role === 'Administrator').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Read-Only Users</span>
                <span className="font-bold">{users.filter(user => user.role === 'Read Only').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement; 