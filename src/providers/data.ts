import { ListResponse } from "@/@types";
import { BACKEND_BASE_URL } from "@/constants";
import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";

if (!BACKEND_BASE_URL) {
  throw new Error("Missing environment variable: VITE_BACKEND_BASE_URL");
}
const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,

    buildQueryParams: async ({ resource, pagination, filters }) => {
      const page = pagination?.currentPage ?? 1;
      const limit = pagination?.pageSize ?? 10;

      const params: Record<string, string | number> = { page, limit };
      filters?.forEach((filter) => {
        const field = "field" in filter ? filter.field : "";
        const value = String(filter.value);

        if (resource === "subjects") {
          if (field === "department") {
            params.department = value;
          }
          if (field === "name" || field === "code") {
            params.search = value;
          }
        }
      });

      return params;
    },
    mapResponse: async (response) => {
      const payload: ListResponse = await response.clone().json();
      return payload.data ?? [];
    },
    getTotalCount: async (response) => {
      const payload: ListResponse = await response.clone().json();
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    },
  },
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export default dataProvider;
