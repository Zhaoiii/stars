import { useCallback, useEffect, useRef, useState } from "react";
import { StudentService } from "../services/studentService";
import userService, { UserService } from "../services/userService";

export interface OptionItem {
  label: string;
  value: string | number;
}

function useDebouncedSearch<T extends any[]>(
  fn: (...args: T) => void,
  delay = 400
) {
  const timerRef = useRef<number | null>(null);
  return useCallback(
    (...args: T) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

export function useStudentSearch() {
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (keyword: string) => {
    setLoading(true);
    try {
      const res = await StudentService.searchStudents({
        keyword,
        page: 1,
        pageSize: 10,
      });
      const items = (res?.data || []) as Array<any>;
      setOptions(
        items.map((s) => ({ label: s.name, value: s.id })) // 以名字匹配日历事件
      );
    } catch (e) {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = useDebouncedSearch((q: string) => doSearch(q || ""), 400);

  useEffect(() => {
    doSearch("");
  }, [doSearch]);

  return { options, loading, onSearch };
}

export function useTeacherSearch() {
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (keyword: string) => {
    setLoading(true);
    try {
      const res = await userService.searchUsers?.({
        keyword,
        page: 1,
        pageSize: 10,
      });
      const items = (res?.data || []) as Array<any>;
      setOptions(
        items.map((u) => ({
          label: u.name || u.username,
          value: u.id,
        }))
      );
    } catch (e) {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = useDebouncedSearch((q: string) => doSearch(q || ""), 400);

  useEffect(() => {
    doSearch("");
  }, [doSearch]);

  return { options, loading, onSearch };
}
