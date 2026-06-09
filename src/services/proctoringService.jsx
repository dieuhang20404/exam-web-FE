import { getProctorings } from "../api/proctoringApi";

// Lấy danh sách sự kiện giám sát
export const getProctoringsService = async (
  query = {}
) => {
  const res = await getProctorings(query);

  return res.data;
};