import { AdminControl } from "@/components/admin/AdminControl";

export const metadata = {
  title: "KingShadP Control Room",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminControl />;
}
