export const validateNumber = (phoneNumber) => {
  const cleanNumber = phoneNumber?.replace(/[\s\-\(\)]/g, "");
  const localPattern = /^05[0-9]{8}$/; // 0501234567
  const withoutLeadingZero = /^5[0-9]{8}$/; // 501234567
  const internationalPattern = /^\+9665[0-9]{8}$/; // +966501234567
  return (
    localPattern.test(cleanNumber) ||
    withoutLeadingZero.test(cleanNumber) ||
    internationalPattern.test(cleanNumber)
  );
};

export const formatNumber = (phoneNumber) => {
  const cleanNumber = phoneNumber?.replace(/[\s\-\(\)]/g, "");
  if (cleanNumber.startsWith("+9665")) return "0" + cleanNumber.substring(4);
  if (cleanNumber.match(/^5[0-9]{8}$/)) return "0" + cleanNumber;
  if (cleanNumber.match(/^05[0-9]{8}$/)) return cleanNumber;
  throw new Error("Invalid mobile number format");
};
