export const buildDoctorQuery = (query) => {
  const filter = {};

  if (query.keyword) {
    filter.name = { $regex: query.keyword, $options: "i" };
  }

  if (query.minExp) {
    filter.experience_year = { $gte: Number(query.minExp) };
  }

  if (query.maxPrice) {
    filter.price = { $lte: Number(query.maxPrice) };
  }

  return filter;
};
