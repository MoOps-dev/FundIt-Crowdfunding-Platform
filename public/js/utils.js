export function showSuccess(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

export const currencyFormatter = (digits) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
  });

export function getDaysLeft(targetDateString) {
  const now = new Date();
  const target = new Date(targetDateString);

  const diffInMs = target - now;
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays > 0 ? diffInDays : 0;
}

export const formattedDate = (e) => {
  const date = new Date(e);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const formattedDateDetailed = (e) => {
  const date = new Date(e);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};