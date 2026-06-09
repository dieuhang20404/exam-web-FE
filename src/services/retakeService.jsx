
import {getRetakes, getRetakeById, createRetake, rejectRetake, grantRetakePermission, getPermissions, getPermissionById} from "../api/retakeApi";

export const getRetakesService = async (query) => {
  const res = await getRetakes(query);
  return res.data;
};

export const getRetakeByIdService = async (id) => {
  const res = await getRetakeById(id);
  return res.data;
};

export const createRetakeService = async (data) => {
  const res = await createRetake(data);
  return res.data;
};

export const rejectRetakeService = async (id) => {
  const res = await rejectRetake(id);
  return res.data;
};

export const grantRetakePermissionService = async (id, data) => {
  const res = await grantRetakePermission(id, data);
  return res.data;
};

export const getPermissionsService = async (query) => {
  const res = await getPermissions(query);
  return res.data;
};

export const getPermissionByIdService = async (id) => {
  const res = await getPermissionById(id);
  return res.data;
};