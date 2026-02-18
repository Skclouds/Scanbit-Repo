import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export const useAdminData = () => {
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.getCurrentUser();
        if (res.success && res.user) {
          setCurrentAdmin(res.user);
        }
      } catch (error: any) {

        if (error?.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("adminAuth");
          localStorage.removeItem("hotelAuth");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  return { currentAdmin, loading, setCurrentAdmin };
};

export const useGlobalSearch = () => {
  const [globalSearchResults, setGlobalSearchResults] = useState<{
    businesses: any[];
    users: any[];
  }>({ businesses: [], users: [] });
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performGlobalSearch = async (query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const [businessesRes, usersRes] = await Promise.all([
          api.getAdminRestaurants({ search: query, limit: 5 }),
          api.getAdminUsers({ search: query, limit: 5 }),
        ]);

        setGlobalSearchResults({
          businesses: businessesRes.data?.restaurants || [],
          users: usersRes.data?.users || [],
        });
      } catch (error) {

        setGlobalSearchResults({ businesses: [], users: [] });
      }
    }, 300);
  };

  return { globalSearchResults, performGlobalSearch };
};
