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

export const queryWithFilters = async (Model, options = {}) => {
  const {
    filters = {},
    search,
    searchFields = [],
    sort = "createdAt",
    order = "desc",
    page = 1,
    limit = 10,
    populate = [],
  } = options;

  const queryConditions = {};

  // Build filters from query parameters
  Object.keys(filters).forEach((key) => {
    applyFilter(key, filters[key], queryConditions);
  });

  // Apply search if provided
  if (search && searchFields.length > 0) {
    const searchRegex = new RegExp(search, "i");

    queryConditions.$or = searchFields.map((field) => {
      if (field === "_id") {
        // Allow searching by stringified ObjectId
        return {
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex: search,
              options: "i",
            },
          },
        };
      }

      return { [field]: searchRegex };
    });
  }

  // Create Mongoose query
  let query = Model.find(queryConditions);

  // Apply population if any
  if (populate.length > 0) {
    populate.forEach((pop) => {
      query = query.populate({
        path: pop.path,
        select: pop.select || "",
      });
    });
  }

  // Apply sorting
  const sortOrder = order === "desc" ? -1 : 1;
  query = query.sort({ [sort]: sortOrder });

  // Apply pagination
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  query = query.skip(skip).limit(limitNum);

  // Execute query
  const total = await Model.countDocuments(queryConditions);
  const data = await query.exec();

  return {
    data,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

function applyFilter(key, value, conditional) {
  if (value === null || value === undefined || value === "") return;

  const matchRange = key.match(/(From|To|Min|Max)$/);

  if (matchRange) {
    const field = key.replace(/From$|To$|Min$|Max$/, "");
    const operatorMap = { From: "$gte", To: "$lte", Min: "$gte", Max: "$lte" };
    const operator = operatorMap[matchRange[1]];

    conditional[field] = {
      ...conditional[field],
      [operator]:
        matchRange[1] === "From" || matchRange[1] === "To"
          ? new Date(value)
          : Number(value),
    };
    return;
  }

  if (value === "true" || value === "false") {
    conditional[key] = value === "true";
    return;
  }

  if (value === "__nullOrEmpty__") {
    conditional.$or = [
      { [key]: null },
      { [key]: { $exists: false } },
      { [key]: "" },
    ];
    return;
  }

  if (!isNaN(value)) {
    conditional[key] = Number(value);
    return;
  }

  const matchAt = key.match(/(At)$/);
  if (matchAt) {
    conditional[key] = new Date(value);
    return;
  }

  conditional[key] = value;
}
