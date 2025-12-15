"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Activity, Edit, Eye, EyeOff, Key, Building } from "lucide-react";
import {
  getCurrentSalon,
  updateCurrentSalon,
  SalonData,
  UpdateSalonData,
  updateSalonLogo,
} from "@/lib/api/salon/salon_api";
import {
  changePassword,
  ChangePasswordData,
} from "@/lib/api/auth/change_password_api";

import Image from "next/image";
import { upload_logo_image } from "@/lib/api/products/upload_image";

// Types for profile data
interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  salon: {
    name: string;
    address: string;
    logo_image: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      profileVisibility: "public" | "private";
      dataSharing: boolean;
      analytics: boolean;
    };
    display: {
      theme: "light" | "dark" | "auto";
      language: string;
      timezone: string;
    };
  };
  stats: {
    totalSessions: number;
    activeUsers: number;
    monthlyRevenue: number;
    lastLogin: string;
  };
}

// Dummy profile data
const dummyProfileData: ProfileData = {
  id: "admin-001",
  name: "Sarah Johnson",
  email: "sarah.johnson@trymystyle.com",
  phone: "+1 (555) 123-4567",
  role: "Salon Administrator",
  avatar: "/api/avatars/admin-001.jpg",
  salon: {
    name: "TryMyStyle Salon",
    address: "123 Fashion Street",
    logo_image: "",
  },
  preferences: {
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    privacy: {
      profileVisibility: "public",
      dataSharing: true,
      analytics: true,
    },
    display: {
      theme: "auto",
      language: "English",
      timezone: "America/New_York",
    },
  },
  stats: {
    totalSessions: 1247,
    activeUsers: 89,
    monthlyRevenue: 45600,
    lastLogin: new Date().toISOString(),
  },
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<ProfileData>(dummyProfileData);
  const [salonData, setSalonData] = useState<SalonData | null>(null);
  const [loadingSalonData, setLoadingSalonData] = useState(false);

  // Independent edit states for each section
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingSalon, setIsEditingSalon] = useState(false);
  const [isEditingSecurity, setIsEditingSecurity] = useState(false);

  // Independent loading states for each section
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [loadingSalon, setLoadingSalon] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  // Security form states
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // input ref
  const inputRef = useRef<HTMLInputElement>(null);
  const [salonLogoImg, setSalonLogoImg] = useState<File | null>(null);

  // Fetch salon data on component mount
  useEffect(() => {
    fetchSalonData();
  }, []);

  const fetchSalonData = async () => {
    setLoadingSalonData(true);
    try {
      const response = await getCurrentSalon();
      if (response.success && response.data) {
        setSalonData(response.data);
        // Update profile salon data with real data
        setProfile((prev) => ({
          ...prev,
          salon: {
            ...prev.salon,
            name: response.data!.name,
            address: response.data!.address,
            logo_image: response.data!.logo_image,
          },
        }));
      } else {
        console.error("Failed to fetch salon data:", response.message);
      }
    } catch (error) {
      console.error("Failed to fetch salon data:", error);
    } finally {
      setLoadingSalonData(false);
    }
  };

  // Personal information save handler
  const handleSavePersonal = async () => {
    setLoadingPersonal(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsEditingPersonal(false);
    setLoadingPersonal(false);
  };

  // Salon information save handler
  const handleSaveSalon = async () => {
    setLoadingSalon(true);
    try {
      const updateData: UpdateSalonData = {
        name: profile.salon.name,
        address: profile.salon.address,
      };

      const response = await updateCurrentSalon(updateData);
      if (response.success && response.data) {
        setSalonData(response.data);
        // Update profile salon data with updated data
        setProfile((prev) => ({
          ...prev,
          salon: {
            ...prev.salon,
            name: response.data!.name,
            address: response.data!.address,
          },
        }));
        setIsEditingSalon(false);
        // Show success message
        alert("Salon information updated successfully!");
      } else {
        console.error("Failed to update salon:", response.message);
        alert(`Failed to update salon: ${response.message}`);
      }
    } catch (error) {
      console.error("Failed to update salon data:", error);
      alert("Failed to update salon data. Please try again.");
    } finally {
      setLoadingSalon(false);
    }
  };

  // Security password change handler
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!password || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }

    // Basic password validation
    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long");
      return;
    }

    setLoadingSecurity(true);
    try {
      const passwordData: ChangePasswordData = {
        current_password: password,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      };

      const response = await changePassword(passwordData);
      if (response.success) {
        // Clear form fields
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsEditingSecurity(false);
        alert("Password changed successfully!");
      } else {
        alert(`Failed to change password: ${response.message}`);
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      alert("Failed to change password. Please try again.");
    } finally {
      setLoadingSecurity(false);
    }
  };

  const handleInputImage = () => {
    inputRef.current?.click();
  };

  const updateImage = async () => {
    console.log("updating image");
    console.log(salonLogoImg);
    if (salonLogoImg != null) {
      const response = await upload_logo_image(salonLogoImg);
      const image_url = response.data;
      if (image_url != null) {
        const response = await updateSalonLogo(encodeURI(image_url));
        console.log(response);
        if (response.status == 200) {
          console.log("update success");
        }
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="image-section shadow-md p-6 bg-white border rounded-2xl">
        <div className="img flex justify-between items-center gap-10">
          {/* Current Logo */}
          <div className="flex flex-col items-center">
            <span className="font-semibold mb-2 text-gray-500">Current</span>
            <div className="w-[100px] h-[100px] bg-black border border-gray-300 flex items-center justify-center rounded shadow-inner overflow-hidden">
              {profile.salon.logo_image != null &&
              profile.salon.logo_image !== "" ? (
                <Image
                  width={100}
                  height={100}
                  alt="Current salon logo"
                  className="object-contain w-full h-full"
                  src={profile.salon.logo_image}
                />
              ) : (
                <span className="text-xs text-gray-400">No Logo</span>
              )}
            </div>
          </div>
          {/* Arrow or Preview Switch */}
          <div className="flex flex-col items-center mx-2">
            <span className="material-symbols-outlined text-3xl text-gray-400 select-none">
              &#8594;
            </span>
            <span className="sr-only">to</span>
          </div>
          {/* New Preview Logo */}
          <div className="flex flex-col items-center">
            <span className="font-semibold mb-2 text-gray-500">Preview</span>
            <div className="w-[100px] h-[100px] bg-black border border-gray-300 flex items-center justify-center rounded shadow-inner overflow-hidden">
              {salonLogoImg ? (
                <Image
                  width={100}
                  height={100}
                  alt="Preview new salon logo"
                  className="object-contain w-full h-full"
                  src={URL.createObjectURL(salonLogoImg)}
                />
              ) : (
                <span className="text-xs text-gray-400">No Change</span>
              )}
            </div>
          </div>
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                setSalonLogoImg(e.target.files[0]);
              }
            }}
          />
          <div className="button flex flex-col justify-between">
            <Button
              onClick={() => {
                handleInputImage();
              }}
            >
              Choose Image
            </Button>

            <Button
              className="mt-10"
              onClick={() => {
                updateImage();
              }}
            >
              Save Image
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Information Section */}
        {/* Salon Information Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Salon Information</span>
                  {loadingSalonData && (
                    <Badge variant="secondary" className="ml-2">
                      Loading...
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Update your salon details and contact information
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={fetchSalonData}
                  variant="outline"
                  size="sm"
                  disabled={loadingSalonData}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={() => setIsEditingSalon(!isEditingSalon)}
                  className="flex items-center space-x-2"
                  variant={isEditingSalon ? "outline" : "default"}
                  disabled={loadingSalonData}
                >
                  <Edit className="h-4 w-4" />
                  <span>{isEditingSalon ? "Cancel" : "Edit"}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salon-name">Salon Name</Label>
                <Input
                  id="salon-name"
                  value={profile.salon.name}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      salon: { ...prev.salon, name: e.target.value },
                    }))
                  }
                  disabled={!isEditingSalon}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="salon-address">Address</Label>
                <Input
                  id="salon-address"
                  value={profile.salon.address}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      salon: { ...prev.salon, address: e.target.value },
                    }))
                  }
                  disabled={!isEditingSalon}
                />
              </div>

              {/* Salon Code (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="salon-code">Salon Code</Label>
                <Input
                  id="salon-code"
                  value={salonData?.code || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Salon Status */}
              <div className="space-y-2">
                <Label htmlFor="salon-status">Status</Label>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={salonData?.is_active ? "default" : "secondary"}
                  >
                    {salonData?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            {isEditingSalon && (
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingSalon(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveSalon} disabled={loadingSalon}>
                  {loadingSalon ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsEditingSecurity(!isEditingSecurity)}
                className="flex items-center space-x-2"
                variant={isEditingSecurity ? "outline" : "default"}
              >
                <Edit className="h-4 w-4" />
                <span>{isEditingSecurity ? "Cancel" : "Edit"}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter current password"
                  disabled={!isEditingSecurity}
                />
                {isEditingSecurity && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (minimum 6 characters)"
                disabled={!isEditingSecurity}
              />
              {isEditingSecurity && newPassword && (
                <div className="text-xs text-muted-foreground">
                  {newPassword.length < 6 ? (
                    <span className="text-red-500">
                      Password must be at least 6 characters
                    </span>
                  ) : (
                    <span className="text-green-500">
                      Password meets minimum requirements
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={!isEditingSecurity}
              />
            </div>

            {isEditingSecurity && (
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingSecurity(false);
                    setPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  disabled={
                    loadingSecurity ||
                    !password ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword.length < 6
                  }
                >
                  {loadingSecurity ? "Changing Password..." : "Change Password"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
