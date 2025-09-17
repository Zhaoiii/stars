import { PaginatedResponse } from "@/services/api";
import { PaginationProps } from "antd/lib/pagination";
import { TableProps } from "antd/lib/table";
import { useState } from "react";

export interface IPagination {
  pageSize: number;
  page: number;
  current?: number;
}

export type Return<T> = [
  Pick<TableProps<T>, "loading" | "dataSource" | "pagination" | "onChange">,
  {
    reset: () => void;
    refresh: (pagination?: PaginationProps) => void;
  }
];

export type Callback<T> = (
  pagination: IPagination
) => Promise<PaginatedResponse<T>> | void;

function useTable<T>(
  callback: Callback<T>,
  initialPagination?: PaginationProps
): Return<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState(
    initialPagination || { current: 1, pageSize: 20, total: 0 }
  );

  async function onChange(page: PaginationProps) {
    setLoading(true);
    const {
      current = 1,
      pageSize = pagination.pageSize || 20,
      ...other
    } = page;
    try {
      const response = await callback({ pageSize, page: current });
      if (response && response.data) {
        setPagination({
          current,
          pageSize,
          total: response.total,
          ...other,
        });
        setData(response.data || []);
        console.log(response.data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }

  return [
    {
      loading,
      onChange,
      dataSource: data,
      pagination: {
        ...pagination,
        showTotal: (total) => `共计 ${total} 条数据`,
      },
    },
    {
      reset: () => onChange({ current: 1, pageSize: pagination?.pageSize }),
      refresh: (page?: PaginationProps) => onChange(page || pagination),
    },
  ];
}

export default useTable;
