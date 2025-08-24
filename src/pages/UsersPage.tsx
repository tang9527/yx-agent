import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import {
  AGENT_USERS,
  AGENT_CREATE_USER,
  AGENT_UPDATE_USER_STATUS,
  AGENT_UPDATE_USER_ORDER_END_TIME,
  AGENT_UPDATE_USER_PASSWORD,
  AGENT_UPDATE_USER_BASIC_INFO,
  CreateUserInput,
  UpdateUserPasswordInput,
  UpdateUserBasicInfoInput,
  UserFilter,
} from "@/lib/graphql";
import { PlusIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import clsx from "clsx";
import ConfirmationModal from "@/components/ConfirmationModal";

const UsersPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    username: string;
    orderEndTime: string;
  }>({ isOpen: false, userId: "", username: "", orderEndTime: "" });

  const [servicePeriodModal, setServicePeriodModal] = useState<{
    isOpen: boolean;
    userId: string;
    username: string;
  }>({ isOpen: false, userId: "", username: "" });

  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    userId: string;
    username: string;
  }>({ isOpen: false, userId: "", username: "" });

  const [userInfoModal, setUserInfoModal] = useState<{
    isOpen: boolean;
    userId: string;
    username: string;
    wx: string;
  }>({ isOpen: false, userId: "", username: "", wx: "" });

  const [newPassword, setNewPassword] = useState<string>("");
  const [newUserInfo, setNewUserInfo] = useState<{ username: string; wx: string }>({ username: "", wx: "" });

  // Loading states
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingUserInfo, setIsUpdatingUserInfo] = useState(false);
  const [isUpdatingServicePeriod, setIsUpdatingServicePeriod] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);

  const [filter, setFilter] = useState<UserFilter>({ expirationStatus: "all" });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>(""); // New state for applied search

  const { data, loading, refetch } = useQuery(AGENT_USERS, {
    variables: { 
      filter: {
        ...filter,
        search: appliedSearchTerm || undefined
      }
    }
  });
  const [createUser] = useMutation(AGENT_CREATE_USER);
  const [updateUserStatus] = useMutation(AGENT_UPDATE_USER_STATUS);
  const [updateUserOrderEndTime] = useMutation(
    AGENT_UPDATE_USER_ORDER_END_TIME
  );
  const [updateUserPassword] = useMutation(AGENT_UPDATE_USER_PASSWORD);
  const [updateUserBasicInfo] = useMutation(AGENT_UPDATE_USER_BASIC_INFO);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>();

  const users = data?.agentUsers || [];

  // Helper function to check if user is active based on orderEndTime
  const isUserActive = (orderEndTime: string) => {
    if (!orderEndTime) return false;
    const endTime = new Date(orderEndTime);
    const now = new Date();
    return endTime > now;
  };

  // Function to generate a random password
  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Function to generate and download CSV file
  const generateCSVAndDownload = (username: string, password: string) => {
    // Create CSV content
    const csvContent = `用户名,密码\n${username},${password}`;
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `user_credentials_${username}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onCreateUser = async (formData: CreateUserInput) => {
    setIsCreatingUser(true);
    try {
      const result = await createUser({
        variables: {
          ...formData,
          wx: formData.wx || ""
        },
      });
      
      // Generate CSV with username and password
      if (result.data?.agentCreateUser) {
        generateCSVAndDownload(formData.username, formData.password);
      }
      
      toast.success("用户创建成功！");
      reset();
      setShowCreateForm(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "创建用户失败");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleStatusToggle = (
    userId: string,
    username: string,
    orderEndTime: string
  ) => {
    setConfirmModal({
      isOpen: true,
      userId,
      username,
      orderEndTime,
    });
  };

  const handleModifyServicePeriod = (userId: string, username: string) => {
    setServicePeriodModal({
      isOpen: true,
      userId,
      username,
    });
  };

  const handleModifyPassword = (userId: string, username: string) => {
    setPasswordModal({
      isOpen: true,
      userId,
      username,
    });
    setNewPassword(generatePassword());
  };

  const handleModifyUserInfo = (userId: string, username: string, wx: string) => {
    setUserInfoModal({
      isOpen: true,
      userId,
      username,
      wx,
    });
    setNewUserInfo({ username, wx });
  };

  const executeServicePeriodChange = async () => {
    setIsUpdatingServicePeriod(true);
    const { userId, username } = servicePeriodModal;

    try {
      // Calculate new order end time based on selected period
      const newOrderEndTime = new Date();
      newOrderEndTime.setDate(newOrderEndTime.getDate() + selectedPeriod);
      const orderEndTimeString = newOrderEndTime.toISOString();

      await updateUserOrderEndTime({
        variables: {
          userId,
          orderEndTime: orderEndTimeString,
        },
      });
      toast.success(
        `用户 "${username}" 的服务期已修改至 ${format(
          new Date(orderEndTimeString),
          "yyyy-MM-dd"
        )}！`
      );
      refetch();
    } catch (error: any) {
      toast.error(error.message || "更新服务期失败");
    } finally {
      setIsUpdatingServicePeriod(false);
      setServicePeriodModal({ ...servicePeriodModal, isOpen: false });
    }
  };

  const executePasswordChange = async () => {
    setIsUpdatingPassword(true);
    const { userId, username } = passwordModal;

    try {
      if (newPassword.length < 6) {
        toast.error("密码长度至少为6位");
        setIsUpdatingPassword(false);
        return;
      }

      await updateUserPassword({
        variables: {
          userId,
          newPassword,
        },
      });
      
      // Generate CSV with username and new password
      generateCSVAndDownload(username, newPassword);
      
      toast.success(`用户 "${username}" 的密码已更新！`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "更新密码失败");
    } finally {
      setIsUpdatingPassword(false);
      setPasswordModal({ ...passwordModal, isOpen: false });
      setNewPassword("");
    }
  };

  const executeUserInfoChange = async () => {
    setIsUpdatingUserInfo(true);
    const { userId, username } = userInfoModal;

    try {
      if (newUserInfo.username.length < 3) {
        toast.error("用户名长度至少为3位");
        setIsUpdatingUserInfo(false);
        return;
      }

      await updateUserBasicInfo({
        variables: {
          userId,
          wx: newUserInfo.wx,
          username: newUserInfo.username
        },
      });
      toast.success(`用户 "${username}" 的信息已更新！`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "更新用户信息失败");
    } finally {
      setIsUpdatingUserInfo(false);
      setUserInfoModal({ ...userInfoModal, isOpen: false });
    }
  };

  const executeStatusToggle = async () => {
    const { userId, username, orderEndTime } = confirmModal;

    try {
      // Check if user is currently active
      const currentlyActive = isUserActive(orderEndTime);

      if (currentlyActive) {
        // Disable user by setting orderEndTime to today's date (midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to midnight
        const orderEndTimeString = today.toISOString();

        await updateUserOrderEndTime({
          variables: {
            userId,
            orderEndTime: orderEndTimeString,
          },
        });
        toast.success(`用户 "${username}" 已禁用！`);
      } else {
        // Enable user by setting orderEndTime to 7 days from now
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const orderEndTimeString = sevenDaysFromNow.toISOString();

        await updateUserOrderEndTime({
          variables: {
            userId,
            orderEndTime: orderEndTimeString,
          },
        });
        toast.success(
          `用户 "${username}" 已启用，服务期至 ${format(
            new Date(orderEndTimeString),
            "yyyy-MM-dd"
          )}！`
        );
      }
      refetch();
    } catch (error: any) {
      toast.error(error.message || "更新用户状态失败");
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('')
    setAppliedSearchTerm('')
  }

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            管理您代理账户下的用户
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            添加用户
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <label htmlFor="filter-status" className="mr-2 text-sm font-medium text-gray-700">
            状态筛选:
          </label>
          <select
            id="filter-status"
            value={filter.expirationStatus}
            onChange={(e) => setFilter({ 
              ...filter, 
              expirationStatus: e.target.value as any,
              expiringInDays: undefined // Clear expiring filter when changing status
            })}
            className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">全部</option>
            <option value="not_expired">活跃</option>
            <option value="expired">已过期</option>
          </select>
        </div>
        
        {/* Expiring soon filter */}
        <div className="flex items-center">
          <label htmlFor="filter-expiring" className="mr-2 text-sm font-medium text-gray-700">
            即将过期:
          </label>
          <select
            id="filter-expiring"
            value={filter.expiringInDays || ""}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : undefined;
              setFilter({ 
                ...filter, 
                expiringInDays: value,
                expirationStatus: value !== undefined ? "not_expired" : filter.expirationStatus // Set to not_expired when filtering by expiring
              });
            }}
            className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">全部</option>
            <option value="7">7天内</option>
            <option value="14">14天内</option>
            <option value="30">30天内</option>
          </select>
        </div>
        
        <div className="flex-1 flex">
          <div className="relative rounded-md shadow-sm flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索微信号或用户名..."
              className="block w-full rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            搜索
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">创建新用户</h3>
          <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  用户名
                </label>
                <input
                  {...register("username", {
                    required: "用户名是必填项",
                    minLength: { value: 3, message: "用户名至少需要3个字符" },
                  })}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="请输入用户名"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  密码
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    {...register("password", {
                      required: "密码是必填项",
                      minLength: { value: 6, message: "密码至少需要6个字符" },
                    })}
                    type="text" // Changed to text to show generated password
                    className="block w-full min-w-0 flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setValue("password", generatePassword())}
                    className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    自动生成
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="wx"
                  className="block text-sm font-medium text-gray-700"
                >
                  微信号
                </label>
                <input
                  {...register("wx")}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="请输入微信号"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isCreatingUser}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isCreatingUser ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    创建中...
                  </>
                ) : (
                  "创建用户"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      到期时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      微信号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={clsx(
                            "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                            isUserActive(user.orderEndTime)
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {isUserActive(user.orderEndTime) ? "活跃" : "已过期"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.orderEndTime
                          ? format(
                              new Date(user.orderEndTime),
                              "yyyy-MM-dd HH:mm"
                            )
                          : "无"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.wx || "无"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(user.createdAt), "yyyy-MM-dd")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleStatusToggle(
                                user.id,
                                user.username,
                                user.orderEndTime
                              )
                            }
                            className={clsx(
                              "inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2",
                              isUserActive(user.orderEndTime)
                                ? "text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500"
                                : "text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500"
                            )}
                          >
                            {isUserActive(user.orderEndTime) ? "禁用" : "启用"}
                          </button>
                          <button
                            onClick={() =>
                              handleModifyServicePeriod(user.id, user.username)
                            }
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            修改到期时间
                          </button>
                          <button
                            onClick={() =>
                              handleModifyPassword(user.id, user.username)
                            }
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            修改密码
                          </button>
                          <button
                            onClick={() =>
                              handleModifyUserInfo(user.id, user.username, user.wx || "")
                            }
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            修改信息
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        暂无用户数据。创建您的第一个用户开始使用。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeStatusToggle}
        title="确认操作"
        message={`确定要${
          isUserActive(confirmModal.orderEndTime) ? "禁用" : "启用"
        }用户 "${confirmModal.username}" 吗？`}
        confirmText={isUserActive(confirmModal.orderEndTime) ? "禁用" : "启用"}
        cancelText="取消"
        type={isUserActive(confirmModal.orderEndTime) ? "warning" : "info"}
      />

      {/* Service Period Modal */}
      {servicePeriodModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() =>
                setServicePeriodModal({ ...servicePeriodModal, isOpen: false })
              }
            />

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      修改到期时间
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        为用户 "{servicePeriodModal.username}"
                        选择新的服务期限：
                      </p>

                      <div className="mt-4">
                        <label
                          htmlFor="service-period"
                          className="block text-sm font-medium text-gray-700"
                        >
                          服务期限
                        </label>
                        <select
                          id="service-period"
                          value={selectedPeriod}
                          onChange={(e) =>
                            setSelectedPeriod(Number(e.target.value))
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="30">30天</option>
                          <option value="60">60天</option>
                          <option value="90">90天</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                    onClick={() =>
                      setServicePeriodModal({
                        ...servicePeriodModal,
                        isOpen: false,
                      })
                    }
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  disabled={isUpdatingServicePeriod}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={executeServicePeriodChange}
                >
                  {isUpdatingServicePeriod ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      更新中...
                    </>
                  ) : (
                    "确认修改"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={() =>
                    setServicePeriodModal({
                      ...servicePeriodModal,
                      isOpen: false,
                    })
                  }
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Modification Modal */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setPasswordModal({ ...passwordModal, isOpen: false })}
            />

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      修改密码
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        为用户 "{passwordModal.username}" 设置新密码：
                      </p>

                      <div className="mt-4">
                        <label
                          htmlFor="new-password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          新密码
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="text"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="block w-full min-w-0 flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="请输入新密码"
                          />
                          <button
                            type="button"
                            onClick={() => setNewPassword(generatePassword())}
                            className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            自动生成
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          密码长度至少为6位，建议包含字母、数字和特殊字符
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setPasswordModal({ ...passwordModal, isOpen: false })}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  disabled={isUpdatingPassword}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={executePasswordChange}
                >
                  {isUpdatingPassword ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      更新中...
                    </>
                  ) : (
                    "确认修改"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={() => setPasswordModal({ ...passwordModal, isOpen: false })}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Info Modification Modal */}
      {userInfoModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setUserInfoModal({ ...userInfoModal, isOpen: false })}
            />

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      修改用户信息
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        修改用户 "{userInfoModal.username}" 的基本信息：
                      </p>

                      <div className="mt-4 space-y-4">
                        <div>
                          <label
                            htmlFor="new-username"
                            className="block text-sm font-medium text-gray-700"
                          >
                            用户名
                          </label>
                          <input
                            type="text"
                            id="new-username"
                            value={newUserInfo.username}
                            onChange={(e) => setNewUserInfo({ ...newUserInfo, username: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="请输入用户名"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="new-wx"
                            className="block text-sm font-medium text-gray-700"
                          >
                            微信号
                          </label>
                          <input
                            type="text"
                            id="new-wx"
                            value={newUserInfo.wx}
                            onChange={(e) => setNewUserInfo({ ...newUserInfo, wx: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="请输入微信号"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setUserInfoModal({ ...userInfoModal, isOpen: false })}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  disabled={isUpdatingUserInfo}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={executeUserInfoChange}
                >
                  {isUpdatingUserInfo ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      更新中...
                    </>
                  ) : (
                    "确认修改"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={() => setUserInfoModal({ ...userInfoModal, isOpen: false })}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default UsersPage;
