const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";

// Trả về "YYYY-MM-DD" theo giờ Việt Nam, bất kể máy đang chạy code này ở timezone nào
export function getVietnamDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: VIETNAM_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // locale "en-CA" định dạng "YYYY-MM-DD"
  return formatter.format(date);
}
