import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, RefreshCw, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";

const UsersPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const syncSubuserServers = useCallback(async () => {
    try {
      await axios.post('/api/subuser-servers-sync');
    } catch (err) {
      console.error('Failed to sync subuser servers:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/server/${id}/users`);
      setUsers(response.data.data);
      await syncSubuserServers();
    } catch (err) {
      setError('Failed to fetch users. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, syncSubuserServers]);

  const handleAddUser = async () => {
    try {
      const response = await axios.post(`/api/server/${id}/users`, { email: newUserEmail });
      setUsers([...users, response.data]);
      setIsAddModalOpen(false);
      setNewUserEmail('');
      await syncSubuserServers();
      toast({
        title: "Success",
        description: "User has been added to the server.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Failed to add user. Please try again later.",
        variant: "destructive",
      });
      console.error(err);
    }
  };
  const handleDeleteUser = async (userUuid) => {
    try {
      await axios.delete(`/api/server/${id}/users/${userUuid}`);
      setUsers(users.filter(user => user.attributes.uuid !== userUuid));
      await syncSubuserServers();
      toast({
        title: "Success",
        description: "User has been removed from the server.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove user. Please try again later.",
        variant: "destructive",
      });
      console.error(err);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="border-neutral-800/50">
        <CardHeader>
          <CardTitle className="text-base">Sub-users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <RefreshCw className="w-6 h-6 text-neutral-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[200px] text-red-400">
              {error}
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="overflow-x-auto"><Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.attributes.username}>
                      <TableCell>{user.attributes.username}</TableCell>
                      <TableCell>{user.attributes.email}</TableCell>
                      <TableCell>
                        <ConfirmDialog
                          title="Delete User"
                          description="Are you sure you want to delete this user? This will remove their access to this server."
                          confirmText="Delete"
                          variant="destructive"
                          onConfirm={() => handleDeleteUser(user.attributes.uuid)}
                          trigger={
                            <Button
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table></div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sub-user</DialogTitle>
            <DialogDescription>
              Grant another user access to this server.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
              <button
                type="button"
                onClick={() => setShowHelp(v => !v)}
                className="flex items-center justify-between w-full text-blue-400 font-medium text-sm"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  How to find the right email
                </span>
                {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showHelp && (
                <ol className="text-sm text-neutral-300 space-y-2 list-none pl-0">
                  <li className="flex gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-medium">1</span>
                    <span>Ask the person you want to invite to go to their <strong className="text-white">My Account</strong> page on this dashboard.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-medium">2</span>
                    <span>Their panel email is based on their account ID — it looks like <code className="text-xs bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">cmn21c53u0000c7qp@gmail.com</code>. They can also find it in their <strong className="text-white">SFTP credentials</strong>.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-medium">3</span>
                    <span>Enter that email below. <strong className="text-white">They must have logged in at least once</strong> before you can add them.</span>
                  </li>
                </ol>
              )}
            </div>
            <Input
              placeholder="Panel email (e.g. cmn21c53u0000c7qp@gmail.com)"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={!newUserEmail.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
