// services/notificationService.js

export const getNotifications = async () => {
  return {
    data: [
      {
        id: 1,
        content: "Bạn có bài kiểm tra mới",
        is_read: false,
      },
    ],
  };
};