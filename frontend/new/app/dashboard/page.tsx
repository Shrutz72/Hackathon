"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, Trash2, CheckCircle2, Clock, AlertTriangle, Search, Filter, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock user complaints (in a real app, this would come from an API)
const MOCK_USER_COMPLAINTS = [
  {
    id: 1,
    title: "Pothole on Anna Salai",
    description: "Large pothole near the intersection of Anna Salai and Mount Road that poses a hazard to vehicles and cyclists.",
    category: "Roads",
    location: "Anna Salai, Chennai",
    status: "in-progress",
    date: "2023-11-15",
    image: "/placeholder.svg?height=200&width=300",
    updates: [
      { date: "2023-11-16", note: "Issue received and assigned to Roads Department" },
      { date: "2023-11-18", note: "Scheduled for repair next week" },
    ],
  },
  {
    id: 2,
    title: "Streetlight not working",
    description: "Streetlight has been out for 3 days, creating a safety concern for pedestrians at night.",
    category: "Utilities",
    location: "T. Nagar, Chennai",
    status: "pending",
    date: "2023-11-17",
    image: "/placeholder.svg?height=200&width=300",
    updates: [{ date: "2023-11-17", note: "Issue received and under review" }],
  },
  {
    id: 3,
    title: "Fallen tree blocking sidewalk",
    description: "Tree fell during last night's storm and is completely blocking the pedestrian walkway.",
    category: "Parks",
    location: "Adyar, Chennai",
    status: "resolved",
    date: "2023-11-10",
    image: "/placeholder.svg?height=200&width=300",
    updates: [
      { date: "2023-11-10", note: "Issue received and assigned to Parks Department" },
      { date: "2023-11-11", note: "Crew dispatched to remove tree" },
      { date: "2023-11-12", note: "Tree removed and sidewalk cleared" },
    ],
  },
];

// Mock notifications
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Complaint Update",
    message: "Your complaint about the pothole on Anna Salai has been scheduled for repair next week.",
    date: "2023-11-18",
    read: false,
    complaintId: 1,
  },
  {
    id: 2,
    title: "Complaint Resolved",
    message: "Your complaint about the fallen tree has been resolved. The tree has been removed and the sidewalk is now clear.",
    date: "2023-11-12",
    read: true,
    complaintId: 3,
  },
  {
    id: 3,
    title: "New Complaint Received",
    message: "Your complaint about the streetlight not working has been received and is under review.",
    date: "2023-11-17",
    read: false,
    complaintId: 2,
  },
];

export default function DashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize with mock data
    setComplaints(MOCK_USER_COMPLAINTS);
    setNotifications(MOCK_NOTIFICATIONS);

    // Try to load complaints from localStorage if available
    try {
      const savedComplaints = localStorage.getItem("userComplaints");
      if (savedComplaints) {
        const parsedComplaints = JSON.parse(savedComplaints);
        setComplaints([...MOCK_USER_COMPLAINTS, ...parsedComplaints]);
      }

      const savedNotifications = localStorage.getItem("userNotifications");
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications([...MOCK_NOTIFICATIONS, ...parsedNotifications]);
      }
    } catch (e) {
      console.error("Error loading saved data:", e);
    }

    // Calculate unread notifications
    const unread = MOCK_NOTIFICATIONS.filter((notification) => !notification.read).length;
    setUnreadCount(unread);
  }, []);

  const refreshData = () => {
    setIsRefreshing(true);

    // Try to reload data from localStorage
    try {
      const savedComplaints = localStorage.getItem("userComplaints");
      if (savedComplaints) {
        const parsedComplaints = JSON.parse(savedComplaints);
        setComplaints([...MOCK_USER_COMPLAINTS, ...parsedComplaints]);
      } else {
        setComplaints(MOCK_USER_COMPLAINTS);
      }

      const savedNotifications = localStorage.getItem("userNotifications");
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications([...MOCK_NOTIFICATIONS, ...parsedNotifications]);
      } else {
        setNotifications(MOCK_NOTIFICATIONS);
      }
    } catch (e) {
      console.error("Error loading saved data:", e);
      setComplaints(MOCK_USER_COMPLAINTS);
      setNotifications(MOCK_NOTIFICATIONS);
    }

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleDeleteComplaint = (complaint) => {
    setComplaintToDelete(complaint);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!complaintToDelete) return;

    const updatedComplaints = complaints.filter((c) => c.id !== complaintToDelete.id);
    setComplaints(updatedComplaints);

    // Update localStorage
    try {
      localStorage.setItem(
        "userComplaints",
        JSON.stringify(updatedComplaints.filter((c) => !MOCK_USER_COMPLAINTS.some((mc) => mc.id === c.id)))
      );
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }

    setDeleteDialogOpen(false);
    setComplaintToDelete(null);
  };

  const markNotificationAsRead = (notificationId) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );

    setNotifications(updatedNotifications);

    // Update unread count
    const unread = updatedNotifications.filter((notification) => !notification.read).length;
    setUnreadCount(unread);

    // Update localStorage
    try {
      localStorage.setItem(
        "userNotifications",
        JSON.stringify(updatedNotifications.filter((n) => !MOCK_NOTIFICATIONS.some((mn) => mn.id === n.id)))
      );
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  };

  const markAllNotificationsAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({ ...notification, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);

    // Update localStorage
    try {
      localStorage.setItem(
        "userNotifications",
        JSON.stringify(updatedNotifications.filter((n) => !MOCK_NOTIFICATIONS.some((mn) => mn.id === n.id)))
      );
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "resolved":
        return "Resolved";
      case "in-progress":
        return "In Progress";
      default:
        return "Pending";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    if (statusFilter !== "all" && complaint.status !== statusFilter) return false;
    if (
      searchQuery &&
      !complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !complaint.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (categoryFilter !== "all" && complaint.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Back Button and Page Title */}
            <div className="flex items-center">
              <Link href="/resident/dashboard">
                <Button variant="ghost" className="text-gray-600 hover:bg-gray-200">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back To Resident Page
                </Button>
              </Link>
            </div>

            {/* Notification Bell */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-gray-700 hover:text-blue-600">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={markAllNotificationsAsRead}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-4 px-2 text-center text-gray-500">No notifications</div>
                    ) : (
                      notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`flex flex-col items-start p-3 ${!notification.read ? "bg-blue-50" : ""}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex w-full justify-between">
                            <span className="font-medium">{notification.title}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">My Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Manage your complaints and track their progress</p>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-xl p-4 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search complaints..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Roads">Roads</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Parks">Parks</SelectItem>
                  <SelectItem value="Public Facilities">Public Facilities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Complaints</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">No Complaints Found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(complaint.status)}
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                complaint.status
                              )}`}
                            >
                              {getStatusText(complaint.status)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{complaint.title}</TableCell>
                        <TableCell>{complaint.category}</TableCell>
                        <TableCell>{new Date(complaint.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/complaint/${complaint.id}`}>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => handleDeleteComplaint(complaint)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this complaint? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}