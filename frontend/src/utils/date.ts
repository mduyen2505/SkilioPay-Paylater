export function formatDate(str: string): string {
  const d = new Date(str);
  if (isNaN(+d)) return "";
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "2-digit"
  });
}