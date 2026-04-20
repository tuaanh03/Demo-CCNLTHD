import { AxiosResponse } from 'axios';
import {
    AdminPermission,
    AdminPermissionCreateRequest,
    AdminPermissionUpdateRequest,
    AdminRole,
    AdminRoleCreateRequest,
    AdminRoleUpdateRequest,
    AdminUser,
    AdminUserUpdateRequest,
    APIResponse,
} from '../types';
import { createApiClient, createTokenStorage } from './api';

// Token admin tách biệt user
const ADMIN_TOKEN_KEY = 'adminAccessToken';

export const adminTokenStorage = createTokenStorage(ADMIN_TOKEN_KEY);

export const adminApiClient = createApiClient({ tokenStorage: adminTokenStorage });

export const adminAuthService = adminApiClient.auth;
export const adminAxios = adminApiClient.instance;

export const adminUserService = {
    getAllUsers: (): Promise<AxiosResponse<APIResponse<AdminUser[]>>> =>
        adminAxios.get<APIResponse<AdminUser[]>>('/users'),
    getUserById: (userId: string): Promise<AxiosResponse<APIResponse<AdminUser>>> =>
        adminAxios.get<APIResponse<AdminUser>>(`/users/${userId}`),
    updateUser: (userId: string, payload: AdminUserUpdateRequest): Promise<AxiosResponse<APIResponse<AdminUser>>> =>
        adminAxios.put<APIResponse<AdminUser>>(`/users/${userId}`, payload),
};

export const adminRoleService = {
    getAllRoles: (): Promise<AxiosResponse<APIResponse<AdminRole[]>>> =>
        adminAxios.get<APIResponse<AdminRole[]>>('/roles'),
    createRole: (payload: AdminRoleCreateRequest): Promise<AxiosResponse<APIResponse<AdminRole>>> =>
        adminAxios.post<APIResponse<AdminRole>>('/roles', payload),
    updateRole: (roleName: string, payload: AdminRoleUpdateRequest): Promise<AxiosResponse<APIResponse<AdminRole>>> =>
        adminAxios.put<APIResponse<AdminRole>>(`/roles/${encodeURIComponent(roleName)}`, payload),
    deleteRole: (roleName: string): Promise<AxiosResponse<APIResponse<void>>> =>
        adminAxios.delete<APIResponse<void>>(`/roles/${encodeURIComponent(roleName)}`),
};

export const adminPermissionService = {
    getAllPermissions: (): Promise<AxiosResponse<APIResponse<AdminPermission[]>>> =>
        adminAxios.get<APIResponse<AdminPermission[]>>('/permissions'),
    createPermission: (payload: AdminPermissionCreateRequest): Promise<AxiosResponse<APIResponse<AdminPermission>>> =>
        adminAxios.post<APIResponse<AdminPermission>>('/permissions', payload),
    updatePermission: (permissionName: string, payload: AdminPermissionUpdateRequest): Promise<AxiosResponse<APIResponse<AdminPermission>>> =>
        adminAxios.put<APIResponse<AdminPermission>>(`/permissions/${encodeURIComponent(permissionName)}`, payload),
    deletePermission: (permissionName: string): Promise<AxiosResponse<APIResponse<void>>> =>
        adminAxios.delete<APIResponse<void>>(`/permissions/${encodeURIComponent(permissionName)}`),
};

