"use server";

import { cookies } from "next/headers";

const getDomain = () =>
  (process.env.API_URL || "http://localhost:8000/api").replace(/\/api$/, "");

export async function login(account: string, password: string) {
  try {
    const res = await fetch(`${getDomain()}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account, password }),
    });

    if (!res.ok) {
      return { success: false, error: "Sai tài khoản hoặc mật khẩu" };
    }

    const json = await res.json();
    const data = json.data;

    if (!data || !data.access_token) {
      return { success: false, error: "Phản hồi từ server không hợp lệ" };
    }

    const cookieStore = await cookies();

    // Lưu Access Token vào HTTPOnly Cookie
    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    // Lưu Refresh Token vào HTTPOnly Cookie
    if (data.refresh_token) {
      cookieStore.set("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });
    }

    return { success: true, user: data.user, error: null };
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) return null;

    const res = await fetch(`${getDomain()}/user/get_access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const newAccessToken = json?.data?.access_token || json?.access_token;

    if (!newAccessToken) return null;

    // Set token mới vào cookie
    cookieStore.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return newAccessToken;
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function register(
  account: string,
  password: string,
  email: string,
  first_name: string,
  last_name: string
) {
  try {
    const res = await fetch(`${getDomain()}/user/create_user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account, password, email, first_name, last_name }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson?.message || "Đăng ký thất bại, vui lòng thử lại" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

export async function changePassword(old_password: string, new_password: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return { success: false, error: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại" };
    }

    const res = await fetch(`${getDomain()}/user/change_pass`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ old_password, new_password }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson?.message || "Mật khẩu cũ không đúng hoặc có lỗi xảy ra" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Change Password Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}

const RAW_HTML_RESPONSE = `<!DOCTYPE html>\n<html lang=\"vi\">\n<head>\n <meta charset=\"UTF-8\">\n <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n <title>Đặt vé máy bay - Hệ thống của bạn</title>\n <!-- Tailwind CSS CDN -->\n <link href=\"https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css\" rel=\"stylesheet\">\n <style>\n /* Tùy chỉnh nhỏ để đảm bảo form đăng nhập nằm giữa trang nếu cần */\n #login-container {\n min-height: calc(100vh - 4rem); /* Trừ đi chiều cao header và footer giả định */\n display: flex;\n align-items: center;\n justify-content: center;\n }\n /* Ẩn nội dung chính và hiển thị form đăng nhập mặc định */\n #main-content {\n display: none;\n }\n </style>\n</head>\n<body class=\"bg-gray-100 font-sans text-gray-800\">\n\n <div class=\"min-h-screen flex flex-col\">\n <!-- Header -->\n <header class=\"bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-md\">\n <div class=\"container mx-auto flex justify-between items-center\">\n <h1 class=\"text-3xl font-bold\">✈️ Hệ thống đặt vé máy bay</h1>\n <nav>\n <a href=\"#\" class=\"mx-2 hover:text-blue-200 transition-colors hidden md:inline-block\">Trang chủ</a>\n <a href=\"#\" class=\"mx-2 hover:text-blue-200 transition-colors hidden md:inline-block\">Tìm chuyến bay</a>\n <a href=\"#\" class=\"mx-2 hover:text-blue-200 transition-colors hidden md:inline-block\">Liên hệ</a>\n </nav>\n </div>\n </header>\n\n <!-- Login Form Container -->\n <div id=\"login-container\" class=\"flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 p-8\">\n <div class=\"max-w-md w-full bg-white p-8 rounded-lg shadow-xl border border-blue-200\">\n <h2 class=\"text-3xl font-extrabold text-center text-blue-700 mb-6\">Đăng nhập hệ thống</h2>\n <form id=\"login-form\">\n <div class=\"mb-4\">\n <label for=\"username\" class=\"block text-gray-700 text-sm font-semibold mb-2\">Tên đăng nhập:</label>\n <input type=\"text\" id=\"username\" name=\"username\" class=\"shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200\" placeholder=\"Nhập tên đăng nhập của bạn\" required>\n </div>\n <div class=\"mb-6\">\n <label for=\"password\" class=\"block text-gray-700 text-sm font-semibold mb-2\">Mật khẩu:</label>\n <input type=\"password\" id=\"password\" name=\"password\" class=\"shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200\" placeholder=\"********\" required>\n </div>\n <div id=\"login-message\" class=\"text-red-600 text-center mb-4 hidden\"></div>\n <button type=\"submit\" class=\"w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
focus:ring-opacity-50 transition duration-300 transform hover:scale-105\">\n Đăng nhập\n </button>\n <p class=\"text-center text-gray-600 text-sm mt-4\">\n Chưa có tài khoản? <a href=\"#\" class=\"text-blue-600 hover:text-blue-800 font-semibold\">Đăng ký ngay</a>\n </p>\n </form>\n </div>\n </div>\n\n <!-- Main Content (Hidden until login) -->\n <main id=\"main-content\" class=\"flex-grow container mx-auto p-6 md:p-8\">\n <div class=\"bg-white rounded-lg shadow-xl p-8 mb-8 border border-green-200\">\n <p id=\"welcome-message\" class=\"text-2xl font-semibold text-green-700 mb-4\"></p>\n <p class=\"text-lg text-gray-700\">Dưới đây là giá vé và dữ liệu cá nhân của bạn. Chúc bạn có một trải nghiệm bay tuyệt vời!</p>\n </div>\n\n <!-- Flight Search Section -->\n <section class=\"bg-white rounded-lg shadow-xl p-6 md:p-8 mb-8 border border-blue-200\">\n <h2 class=\"text-3xl font-bold text-blue-700 mb-6\">Tìm chuyến bay</h2>\n <form class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">\n <div>\n <label for=\"origin\" class=\"block text-gray-700 text-sm font-semibold mb-2\">Điểm khởi hành:</label>\n <input type=\"text\" id=\"origin\" class=\"shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500\" placeholder=\"VD: TP.
Hồ Chí Minh\">\n </div>\n <div>\n <label for=\"destination\" class=\"block text-gray-700 text-sm font-semibold mb-2\">Điểm đến:</label>\n <input type=\"text\" id=\"destination\" class=\"shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500\" placeholder=\"VD: Hà Nội\">\n </div>\n <div>\n <label for=\"date\" class=\"block text-gray-700 text-sm font-semibold mb-2\">Ngày đi:</label>\n <input type=\"date\" id=\"date\" class=\"shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500\">\n </div>\n <div>\n <label for=\"passengers\" class=\"block text-gray-700 text-sm font-semibold mb-2\">Số hành khách:</label>\n <input type=\"number\" id=\"passengers\" min=\"1\" value=\"1\" class=\"shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500\">\n </div>\n <div class=\"lg:col-span-4 mt-4\">\n <button type=\"submit\" class=\"w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105\">\n Tìm chuyến bay\n </button>\n </div>\n </form>\n </section>\n\n <!-- Featured Airlines/Deals Section -->\n <section class=\"bg-white rounded-lg shadow-xl p-6 md:p-8 mb-8 border border-purple-200\">\n <h2 class=\"text-3xl font-bold text-purple-700 mb-6\">Các hãng hàng không và ưu đãi nổi bật</h2>\n <div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">\n <!-- Airline Card 1 -->\n <div class=\"bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200\">\n <h3 class=\"text-xl font-bold text-gray-800 mb-2\">Vietnam Airlines</h3>\n <p class=\"text-gray-600 mb-3\">Hãng hàng không quốc gia với dịch vụ 4 sao. Ưu đãi vé đi Châu Âu chỉ từ 15,000,000 VND!</p>\n <a href=\"#\" class=\"text-blue-600 hover:text-blue-800 font-semibold\">Xem chi tiết</a>\n </div>\n <!-- Airline Card 2 -->\n <div class=\"bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200\">\n <h3 class=\"text-xl font-bold text-gray-800 mb-2\">Vietjet Air</h3>\n <p class=\"text-gray-600 mb-3\">Hãng hàng không giá rẻ hàng đầu Việt Nam. Săn vé 0đ mỗi ngày!</p>\n <a href=\"#\" class=\"text-blue-600 hover:text-blue-800 font-semibold\">Xem chi tiết</a>\n </div>\n <!-- Airline Card 3 -->\n <div class=\"bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200\">\n <h3 class=\"text-xl font-bold text-gray-800 mb-2\">Bamboo Airways</h3>\n <p class=\"text-gray-600 mb-3\">Trải nghiệm bay chuẩn 5 sao.
Giảm 20% cho chặng bay nội địa tháng này!</p>\n <a href=\"#\" class=\"text-blue-600 hover:text-blue-800 font-semibold\">Xem chi tiết</a>\n </div>\n </div>\n </section>\n </main>\n\n <!-- Footer -->\n <footer class=\"bg-gray-800 text-white p-4 text-center mt-auto shadow-inner\">\n <p>&copy; 2023 Hệ thống đặt vé máy bay. Bảo lưu mọi quyền.</p>\n </footer>\n </div>\n\n <script>\n document.addEventListener('DOMContentLoaded', function() {\n const loginForm = document.getElementById('login-form');\n const usernameInput = document.getElementById('username');\n const passwordInput = document.getElementById('password');\n const loginMessage = document.getElementById('login-message');\n const loginContainer = document.getElementById('login-container');\n const mainContent = document.getElementById('main-content');\n const welcomeMessage = document.getElementById('welcome-message');\n\n // Hardcoded credentials for demonstration\n const CORRECT_USERNAME = 'user';\n const CORRECT_PASSWORD = 'password';\n\n loginForm.addEventListener('submit', function(event) {\n event.preventDefault(); // Prevent actual form submission\n\n const enteredUsername = usernameInput.value;\n const enteredPassword = passwordInput.value;\n\n if (enteredUsername === CORRECT_USERNAME && enteredPassword === CORRECT_PASSWORD) {\n loginMessage.classList.add('hidden');\n loginContainer.style.display = 'none'; // Hide the login form\n mainContent.style.display = 'block'; // Show the main content\n\n // Update the welcome message\n welcomeMessage.textContent = 'Xin chào!Đăng nhập thành công, dưới đây là giá vé / dữ liệu của bạn...';\n } else {\n loginMessage.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.';\n loginMessage.classList.remove('hidden');\n // Clear password field for security\n passwordInput.value = '';\n }\n });\n });\n </script>\n</body>\n</html>`;

export async function CallChat(message: string) {
  // MOCK MODE — bật khi MOCK_CHAT=true trong .env.local
  if (process.env.MOCK_CHAT === "true") {
    await new Promise((r) => setTimeout(r, 800)); // giả lập delay
    return { success: true, error: null, data: RAW_HTML_RESPONSE };
  }

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const res = await fetch(`${getDomain()}/chat/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const errText = await res.text();
      try {
        const errJson = JSON.parse(errText);
        return { success: false, error: errJson?.message || errJson?.detail || `Lỗi ${res.status}` };
      } catch (e) {
        return { success: false, error: `Lỗi HTTP ${res.status}: ${errText.slice(0, 50)}` };
      }
    }

    const rawData = await res.text();
    let finalHtml = rawData;

    try {
      const parsed = JSON.parse(rawData);
      if (typeof parsed === 'string') {
        finalHtml = parsed;
      } else if (parsed && parsed.data) {
        finalHtml = parsed.data;
      }
    } catch (e) {
      // Bỏ qua lỗi parse JSON vì đây là file text HTML thuần túy từ server API
    }

    return { success: true, error: null, data: finalHtml };
  } catch (error) {
    console.error("CallChat Error:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ" };
  }
}
