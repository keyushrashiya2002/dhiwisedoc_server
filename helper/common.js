import moment from "moment-timezone";

export const paginationFun = (data) => {
  const { page = 1, limit = 10 } = data;

  return {
    limit: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
  };
};

export const paginationDetails = ({ page = 1, totalItems, limit }) => {
  const totalPages = Math.ceil(totalItems / limit);
  return { page: Number(page), totalPages, totalItems, limit };
};

export const monthFilter = (query) => {
  const { from, to } = query;

  // Get current month's range
  let fromDate = moment().startOf("month");
  let toDate = moment().endOf("month").add(1, "day");

  // If from and to are provided, use them
  if (from && to) {
    fromDate = moment(from);
    toDate = moment(to).add(1, "day");
  }

  return { fromDate, toDate };
};
