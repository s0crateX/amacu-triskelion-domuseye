"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Users,
  UserPlus,
  Building,
  Eye,
  LogOut,
  Shield,
  Plus,
  Search,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Trash2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import {
  getAllUsers,
  getUserStatistics,
  createAgentAccount,
  deleteAgentAccount,
  logoutAdmin,
  CreateAgentData,
  UserDocument,
} from "@/lib/auth/admin-auth-utils";

interface UserStats {
  total: number;
  tenants: number;
  landlords: number;
  agents: number;
}

// Property specialties options
const PROPERTY_SPECIALTIES = [
  "Residential",
  "Commercial",
  "Luxury Homes",
  "Condominiums",
  "Apartments",
  "Townhouses",
  "Investment Properties",
  "New Construction",
  "Foreclosures",
  "Rental Properties",
  "Land/Lots",
  "Vacation Homes",
];

export default function AdminDashboard() {
  const router = useRouter();
  const { adminData, isAuthenticated, loading } = useAdminAuth();
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    tenants: 0,
    landlords: 0,
    agents: 0,
  });
  const [filteredUsers, setFilteredUsers] = useState<UserDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [agentFormData, setAgentFormData] = useState<CreateAgentData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    dateOfBirth: "",
    businessAddress: "",
    businessLatitude: undefined,
    businessLongitude: undefined,
    experience: "",
    specialities: [],
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<UserDocument | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAgent, setDeletingAgent] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch users and statistics
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsersAndStats();
    }
  }, [isAuthenticated]);

  // Filter users based on search and tab - show only agents in table
  useEffect(() => {
    let filtered = users;

    // Always filter to show only agents in the table
    filtered = filtered.filter((user) => user.userType === "agent");

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          (user.firstName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.lastName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsersAndStats = async () => {
    try {
      setLoadingUsers(true);
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getUserStatistics(),
      ]);
      setUsers(usersData);
      setUserStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch user data");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      toast.success("Logged out successfully");
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !agentFormData.firstName ||
      !agentFormData.lastName ||
      !agentFormData.email ||
      !agentFormData.password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreatingAgent(true);

    try {
      await createAgentAccount(agentFormData);
      toast.success("Agent account created successfully!");
      setShowCreateAgent(false);
      setAgentFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        companyName: "",
        dateOfBirth: "",
        businessAddress: "",
        businessLatitude: undefined,
        businessLongitude: undefined,
        experience: "",
        specialities: [],
      });
      // Refresh users list
      fetchUsersAndStats();
    } catch (error) {
      console.error("Error creating agent:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create agent account";
      toast.error(errorMessage);
    } finally {
      setCreatingAgent(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;

    if (deleteConfirmation !== "DELETE AGENT") {
      toast.error("Please type 'DELETE AGENT' to confirm deletion");
      return;
    }

    setDeletingAgent(true);

    try {
      await deleteAgentAccount(agentToDelete.id, deleteConfirmation);
      toast.success(
        `Agent ${agentToDelete.firstName} ${agentToDelete.lastName} has been deleted successfully`
      );
      setShowDeleteDialog(false);
      setAgentToDelete(null);
      setDeleteConfirmation("");
      // Refresh users list
      fetchUsersAndStats();
    } catch (error) {
      console.error("Error deleting agent:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete agent account";
      toast.error(errorMessage);
    } finally {
      setDeletingAgent(false);
    }
  };

  const openDeleteDialog = (agent: UserDocument) => {
    setAgentToDelete(agent);
    setDeleteConfirmation("");
    setShowDeleteDialog(true);
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "tenant":
        return "bg-blue-100 text-blue-800";
      case "landlord":
        return "bg-green-100 text-green-800";
      case "agent":
        return "bg-purple-100 text-purple-800";
      case "unknown":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (
    date: Date | { toDate: () => Date } | string | null | undefined
  ) => {
    if (!date) return "N/A";
    try {
      const dateObj =
        typeof date === "object" && "toDate" in date
          ? date.toDate()
          : new Date(date as string | Date);
      return dateObj.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                DomusEye Administration Portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {adminData?.displayName}
              </p>
              <p className="text-xs text-muted-foreground">{adminData?.role}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {userStats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                All registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tenants</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {userStats.tenants}
              </div>
              <p className="text-xs text-muted-foreground">Property seekers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Landlords</CardTitle>
              <Building className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {userStats.landlords}
              </div>
              <p className="text-xs text-muted-foreground">Property owners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agents</CardTitle>
              <UserPlus className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {userStats.agents}
              </div>
              <p className="text-xs text-muted-foreground">
                Real estate agents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Monitor and manage all platform users
                </CardDescription>
              </div>

              <Dialog open={showCreateAgent} onOpenChange={setShowCreateAgent}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Agent
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border-0 rounded-xl">
                  <DialogHeader className="pb-6 border-b border-border/50 shrink-0">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      Create New Agent Account
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      Create a new real estate agent account with access to the
                      platform. Fill in the required information below.
                    </DialogDescription>
                  </DialogHeader>

                  <ScrollArea className="flex-1 overflow-y-auto px-1">
                    <form
                      id="agent-form"
                      onSubmit={handleCreateAgent}
                      className="space-y-8 p-6"
                    >
                      {/* Personal Information */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 pb-3 border-b border-muted">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              1
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Personal Information
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Basic agent details
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="firstName"
                              className="text-sm font-medium text-foreground"
                            >
                              First Name{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="firstName"
                              value={agentFormData.firstName}
                              onChange={(e) =>
                                setAgentFormData((prev) => ({
                                  ...prev,
                                  firstName: e.target.value,
                                }))
                              }
                              className="h-10"
                              placeholder="Enter first name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="lastName"
                              className="text-sm font-medium text-foreground"
                            >
                              Last Name{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="lastName"
                              value={agentFormData.lastName}
                              onChange={(e) =>
                                setAgentFormData((prev) => ({
                                  ...prev,
                                  lastName: e.target.value,
                                }))
                              }
                              className="h-10"
                              placeholder="Enter last name"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="email"
                              className="text-sm font-medium text-foreground"
                            >
                              Email Address{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={agentFormData.email}
                              onChange={(e) =>
                                setAgentFormData((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              className="h-10"
                              placeholder="Enter email address"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="phone"
                              className="text-sm font-medium text-foreground"
                            >
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={agentFormData.phone}
                              onChange={(e) =>
                                setAgentFormData((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                              className="h-10"
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="password"
                              className="text-sm font-medium text-foreground"
                            >
                              Password{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={agentFormData.password}
                              onChange={(e) =>
                                setAgentFormData((prev) => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                              className="h-10"
                              placeholder="Enter secure password"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="dateOfBirth"
                              className="text-sm font-medium text-foreground"
                            >
                              Date of Birth
                            </Label>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={agentFormData.dateOfBirth}
                              onChange={(e) =>
                                setAgentFormData((prev) => ({
                                  ...prev,
                                  dateOfBirth: e.target.value,
                                }))
                              }
                              className="h-10"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Business Information */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 pb-3 border-b border-muted">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              2
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Business Information
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Company and location details
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="companyName"
                            className="text-sm font-medium text-foreground"
                          >
                            Company Name
                          </Label>
                          <Input
                            id="companyName"
                            value={agentFormData.companyName}
                            onChange={(e) =>
                              setAgentFormData((prev) => ({
                                ...prev,
                                companyName: e.target.value,
                              }))
                            }
                            className="h-10"
                            placeholder="Enter company name"
                          />
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 pb-3 border-b border-muted">
                          <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">
                              3
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Professional Information
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Experience and specialties
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="experience"
                            className="text-sm font-medium text-foreground"
                          >
                            Years of Experience
                          </Label>
                          <Input
                            id="experience"
                            type="number"
                            min="0"
                            max="50"
                            value={agentFormData.experience}
                            onChange={(e) =>
                              setAgentFormData((prev) => ({
                                ...prev,
                                experience: e.target.value,
                              }))
                            }
                            className="h-10"
                            placeholder="Enter years of experience"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="specialities"
                            className="text-sm font-medium text-foreground"
                          >
                            Property Specialties
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between h-10 text-left font-normal"
                              >
                                <span className="truncate">
                                  {(agentFormData.specialities?.length ?? 0) > 0
                                    ? `${
                                        agentFormData.specialities?.length ?? 0
                                      } specialt${
                                        (agentFormData.specialities?.length ??
                                          0) === 1
                                          ? "y"
                                          : "ies"
                                      } selected`
                                    : "Select property specialties"}
                                </span>
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-full p-0"
                              align="start"
                            >
                              <div className="p-3 border-b">
                                <p className="text-sm font-medium">
                                  Select Property Specialties
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Choose areas of expertise
                                </p>
                              </div>
                              <ScrollArea className="h-48">
                                <div className="p-3 space-y-3">
                                  {PROPERTY_SPECIALTIES.map((specialty) => (
                                    <div
                                      key={specialty}
                                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                                    >
                                      <Checkbox
                                        id={specialty}
                                        checked={agentFormData.specialities?.includes(
                                          specialty
                                        )}
                                        onCheckedChange={(checked) => {
                                          setAgentFormData((prev) => {
                                            const currentSpecialities =
                                              prev.specialities || [];
                                            if (checked) {
                                              return {
                                                ...prev,
                                                specialities: [
                                                  ...currentSpecialities,
                                                  specialty,
                                                ],
                                              };
                                            } else {
                                              return {
                                                ...prev,
                                                specialities:
                                                  currentSpecialities.filter(
                                                    (s) => s !== specialty
                                                  ),
                                              };
                                            }
                                          });
                                        }}
                                      />
                                      <Label
                                        htmlFor={specialty}
                                        className="text-sm font-medium cursor-pointer flex-1"
                                      >
                                        {specialty}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </PopoverContent>
                          </Popover>
                          {(agentFormData.specialities?.length ?? 0) > 0 && (
                            <div className="mt-4 p-3 bg-muted/30 rounded-md">
                              <p className="text-sm font-medium text-foreground mb-3">
                                Selected Specialties (
                                {agentFormData.specialities?.length ?? 0}):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {agentFormData.specialities?.map(
                                  (specialty) => (
                                    <Badge
                                      key={specialty}
                                      variant="secondary"
                                      className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
                                    >
                                      {specialty}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </form>
                  </ScrollArea>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-6 px-6 pb-2 border-t bg-background/50 shrink-0">
                    <div className="text-xs text-muted-foreground">
                      <span className="text-destructive">*</span> Required
                      fields
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateAgent(false)}
                        className="h-10 px-6"
                        disabled={creatingAgent}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={creatingAgent}
                        form="agent-form"
                        className="h-10 px-6 bg-primary hover:bg-primary/90"
                      >
                        {creatingAgent ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Creating...
                          </>
                        ) : (
                          "Create Agent Account"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent>
            {/* Search and Filter */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search agents by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="w-full">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Agent Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage real estate agents ({userStats.agents} total)
                </p>
              </div>

              <div className="mt-6">
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading agents...</p>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No agents found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={user.profilePicture} />
                                    <AvatarFallback>
                                      {(user.firstName || "U")[0]}
                                      {(user.lastName || "N")[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {user.firstName || "N/A"}{" "}
                                      {user.lastName || ""}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {user.email || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getUserTypeColor(
                                    user.userType || "unknown"
                                  )}
                                >
                                  {user.userType || "unknown"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="flex items-center space-x-1">
                                    <Mail className="w-3 h-3" />
                                    <span>{user.email || "N/A"}</span>
                                  </div>
                                  {user.phone && (
                                    <div className="flex items-center space-x-1 mt-1">
                                      <Phone className="w-3 h-3" />
                                      <span>{user.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1 text-sm">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(user.createdAt)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.isOnline ? "default" : "secondary"
                                  }
                                >
                                  {user.isOnline ? "Online" : "Offline"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => openDeleteDialog(user)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Agent
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Agent Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <DialogTitle className="text-red-600">
                  Delete Agent Account
                </DialogTitle>
              </div>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                agent account and remove all associated data.
              </DialogDescription>
            </DialogHeader>

            {agentToDelete && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={agentToDelete.profilePicture} />
                      <AvatarFallback>
                        {(agentToDelete.firstName || "U")[0]}
                        {(agentToDelete.lastName || "N")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-red-900">
                        {agentToDelete.firstName} {agentToDelete.lastName}
                      </p>
                      <p className="text-sm text-red-700">
                        {agentToDelete.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="deleteConfirmation"
                    className="text-sm font-medium"
                  >
                    Type{" "}
                    <span className="font-bold text-red-600">DELETE AGENT</span>{" "}
                    to confirm:
                  </Label>
                  <Input
                    id="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE AGENT"
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setAgentToDelete(null);
                      setDeleteConfirmation("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAgent}
                    disabled={
                      deletingAgent || deleteConfirmation !== "DELETE AGENT"
                    }
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deletingAgent ? "Deleting..." : "Delete Agent"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
