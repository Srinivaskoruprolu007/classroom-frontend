import {
  BaseRecord,
  DataProvider,
  GetListParams,
  GetListResponse,
} from "@refinedev/core";

import { Subject } from "@/@types";

const MOCK_SUBJECTS: Subject[] = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Programming",
    department: "cs",
    description:
      "Covers programming fundamentals, problem-solving, and basic software design using modern languages.",
    createdAt: "2026-02-24T00:00:00.000Z",
  },
  {
    id: 2,
    code: "MATH201",
    name: "Calculus II",
    department: "math",
    description:
      "Focuses on integration techniques, sequences, series, and practical applications in engineering and science.",
    createdAt: "2026-02-24T00:00:00.000Z",
  },
  {
    id: 3,
    code: "PHY150",
    name: "General Physics",
    department: "phy",
    description:
      "Introduces mechanics, energy, waves, and laboratory-based analysis for foundational physical principles.",
    createdAt: "2026-02-24T00:00:00.000Z",
  },
];

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({
    resource,
    pagination,
    filters,
    sorters,
  }: GetListParams): Promise<GetListResponse<TData>> => {
    if (resource !== "subjects") {
      return {
        data: [] as TData[],
        total: 0,
      };
    }

    const typedFilters = (filters ?? []).filter(
      (item): item is { field: string; operator: string; value: unknown } =>
        typeof item === "object" &&
        item !== null &&
        "field" in item &&
        "operator" in item &&
        "value" in item,
    );

    let rows = [...MOCK_SUBJECTS];

    for (const filter of typedFilters) {
      if (filter.field === "department" && filter.operator === "eq") {
        rows = rows.filter((row) => row.department === String(filter.value));
      }

      if (filter.field === "name" && filter.operator === "contains") {
        const query = String(filter.value).toLowerCase();
        rows = rows.filter((row) => row.name.toLowerCase().includes(query));
      }
    }

    const typedSorters = (sorters ?? []).filter(
      (item): item is { field: keyof Subject; order: "asc" | "desc" } =>
        typeof item === "object" &&
        item !== null &&
        "field" in item &&
        "order" in item &&
        (item.order === "asc" || item.order === "desc"),
    );

    if (typedSorters.length > 0) {
      const compositeComparator = (a: Subject, b: Subject) => {
        for (const sorter of typedSorters) {
          const aValue = a[sorter.field];
          const bValue = b[sorter.field];

          if (aValue === bValue) continue;
          if (aValue === undefined || aValue === null) return 1;
          if (bValue === undefined || bValue === null) return -1;

          const result = String(aValue).localeCompare(String(bValue), undefined, {
            numeric: true,
            sensitivity: "base",
          });

          if (result !== 0) {
            return sorter.order === "asc" ? result : -result;
          }
        }

        return 0;
      };

      rows.sort(compositeComparator);
    }

    const current = pagination?.current ?? 1;
    const pageSize = pagination?.pageSize ?? rows.length;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    const paginatedRows = rows.slice(start, end);

    return {
      data: paginatedRows as unknown as TData[],
      total: rows.length,
    };
  },
  getOne: async (params) => {
    console.warn(
      `[dataProvider] getOne fallback for resource "${params.resource}" and id "${String(params.id)}".`,
    );
    const subject =
      params.resource === "subjects"
        ? MOCK_SUBJECTS.find((item) => String(item.id) === String(params.id))
        : undefined;

    return {
      data: (subject ??
        ({
          id: params.id,
        } as BaseRecord)) as BaseRecord,
    };
  },
  create: async (params) => {
    console.warn(
      `[dataProvider] create fallback for resource "${params.resource}". No persistence is performed.`,
    );

    return {
      data: {
        id: Date.now(),
        ...(params.variables as Record<string, unknown>),
      } as BaseRecord,
    };
  },
  update: async (params) => {
    console.warn(
      `[dataProvider] update fallback for resource "${params.resource}" and id "${String(params.id)}". No persistence is performed.`,
    );

    return {
      data: {
        id: params.id,
        ...(params.variables as Record<string, unknown>),
      } as BaseRecord,
    };
  },
  deleteOne: async (params) => {
    console.warn(
      `[dataProvider] deleteOne fallback for resource "${params.resource}" and id "${String(params.id)}". No persistence is performed.`,
    );

    return {
      data: {
        id: params.id,
      } as BaseRecord,
    };
  },
  getApiUrl: () => {
    return "";
  },
};
