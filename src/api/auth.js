const fakeUsers = {
  "admin@gmail.com": {
    role: "teacher",
    name: "Admin"
  },
  "student@gmail.com": {
    role: "student",
    name: "Nguyễn Văn B"
  }
};

export const login = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = fakeUsers[data.email] || {
        role: "student",
        name: "Khách"
      };

      resolve({
        data: {
          accessToken: "fake-token",
          user
        }
      });
    }, 1000);
  });
};