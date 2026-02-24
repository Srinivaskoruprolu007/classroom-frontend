import { Subject } from "@/@types";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS } from "@/constants";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

const SubjectList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const permanentFilters = useMemo(() => {
    const filters = [] as Array<{
      field: string;
      operator: "eq" | "contains";
      value: string;
    }>;

    if (selectedDepartment !== "all") {
      filters.push({
        field: "department",
        operator: "eq",
        value: selectedDepartment,
      });
    }

    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      filters.push({
        field: "name",
        operator: "contains",
        value: trimmedQuery,
      });
    }

    return filters;
  }, [searchQuery, selectedDepartment]);

  const subjectTable = useTable<Subject>({
    columns: useMemo<ColumnDef<Subject>[]>(
      () => [
        {
          id: "code",
          accessorKey: "code",
          size: 100,
          header: () => <p className="col-title ml-2">Code</p>,
          cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
        },
        {
          id: "name",
          accessorKey: "name",
          size: 200,
          header: () => <p className="col-title">Name</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "department",
          accessorKey: "department",
          size: 150,
          header: () => <p className="col-title">Department</p>,
          cell: ({ getValue }) => {
            const departmentValue = getValue<string>();
            const department = DEPARTMENTS.find(
              (dept) => dept.value === departmentValue,
            );
            const badgeByDepartment: Record<string, string> = {
              cs: "border-sky-200 bg-sky-50 text-sky-700",
              math: "border-emerald-200 bg-emerald-50 text-emerald-700",
              phy: "border-amber-200 bg-amber-50 text-amber-700",
            };
            return (
              <Badge
                variant="outline"
                className={`rounded-full px-2.5 py-1 font-medium ${
                  badgeByDepartment[departmentValue] ??
                  "border-muted-foreground/20 bg-muted text-foreground"
                }`}
              >
                {department ? department.label : "Unknown"}
              </Badge>
            );
          },
        },
        {
          id: "description",
          accessorKey: "description",
          size: 200,
          header: () => <p className="col-title">Description</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<string>()}</span>
          ),
        },
      ],
      [],
    ),
    refineCoreProps: {
      resource: "subjects",
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      filters: {
        permanent: permanentFilters,
      },
      sorters: {
        initial: [
          {
            field: "id",
            order: "desc",
          },
        ],
      },
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Subjects</h1>
      <div className="intro-row">
        <p>Quick access to essential metric and management tools</p>
        <div className="action-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="search"
              placeholder="search by name"
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((department) => (
                  <SelectItem key={department.value} value={department.value}>
                    {department.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateButton />
          </div>
        </div>
      </div>
      <DataTable table={subjectTable} />
    </ListView>
  );
};

export default SubjectList;
