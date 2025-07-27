import { id } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";

export const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatWeight = (weight) => {
  if (!weight) return "";

  const [unit, value] = weight.split("_");

  if (unit === "KG") return `${value}kg`;
  if (unit === "GRAM") return `${value}gram`;

  return weight;
};

export const formatCategory = (category) => {
  if (!category) return "";

  const formattedCategory = category
    ?.toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return formattedCategory;
};

export function formatGender(gender) {
  switch (gender) {
    case "LAKI_LAKI":
      return "Laki-laki";
    case "PEREMPUAN":
      return "Perempuan";
    default:
      return gender;
  }
}

export const formatDate = (isoString) => {
  const date = new Date(isoString);

  const options = {
    timeZone: "Asia/Jakarta",
  };

  const day = date.toLocaleString("id-ID", { ...options, day: "2-digit" });
  const month = date.toLocaleString("id-ID", { ...options, month: "2-digit" });
  const year = date.toLocaleString("id-ID", { ...options, year: "numeric" });
  const hour = date.toLocaleString("id-ID", {
    ...options,
    hour: "2-digit",
    hour12: false,
  });
  const minute = date.toLocaleString("id-ID", {
    ...options,
    minute: "2-digit",
  });

  return `${day}-${month}-${year} ${hour}:${minute} WIB`;
};

export const calculateTotalPrice = (data) => {
  return data.reduce((total, item) => total + item.price, 0);
};

export const calculateTotalPaidOrderPrice = (data) => {
  return data.reduce((total, order) => total + order.total_price, 0);
};

export const getShippingCost = (city) => {
  return city === "" ? 0 : 4000;
};

export const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return token;
};

export const getRole = () => {
  const role = localStorage.getItem("role");
  if (!role) return null;
  return role;
};

export const getStatusColor = (status) => {
  switch (status) {
    case "DIPROSES":
      return "bg-yellow-100 text-yellow-600";
    case "DIBAYAR":
      return "bg-orange-100 text-orange-600";
    case "DIKIRIM":
      return "bg-blue-100 text-blue-600";
    case "SELESAI":
      return "bg-green-100 text-green-600";
    default:
      return "bg-red-100 text-red-600";
  }
};

export function formatRelativeTime(date) {
  if (!date) return "-";
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: id,
  });
}

export const transformLoginError = (errorMessage) => {
  const errors = {
    email: false,
    emailMsgError: "",
    password: false,
    passwordMsgError: "",
  };

  let message = errorMessage.toLowerCase();

  const isEmailErrorExist = message.includes("email");
  const isPasswordErrorExist = message.includes("password");

  if (isEmailErrorExist) {
    errors.email = true;
  }
  if (isPasswordErrorExist) {
    errors.password = true;
  }

  const isEmailvalid = message.includes('"email" must be a valid email');
  const isEmailEmpty = message.includes('"email" is not allowed to be empty');
  const isPasswordEmpty = message.includes(
    '"password" is not allowed to be empty'
  );

  if (isEmailvalid) {
    errors.emailMsgError = "Email harus berupa email yang valid";
  }

  if (isEmailEmpty) {
    errors.emailMsgError = "Email tidak boleh kosong";
  }

  if (isPasswordEmpty) {
    errors.passwordMsgError = "Password tidak boleh kosong";
  }

  if (!isEmailvalid && !isEmailEmpty && !isPasswordEmpty) {
    errors.emailMsgError = "Email atau password salah";
    errors.passwordMsgError = "Email atau password salah";
  }

  return errors;
};
