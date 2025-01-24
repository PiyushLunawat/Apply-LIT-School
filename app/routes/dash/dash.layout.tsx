// app/routes/dashboard.layout.tsx
import { Outlet, Link } from "@remix-run/react";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex" }}>
      <aside style={{ width: "200px", background: "#f0f0f0" }}>
        <nav>
          <ul>
            <li>
              <Link to="/dashboard">Dashboard Home</Link>
            </li>
            <li>
              <Link to="/dashboard/settings">Settings</Link>
            </li>
            <li>
              <Link to="/dashboard/profile">Profile</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <section style={{ marginLeft: "20px", flex: 1 }}>
        {/* Nested dashboard routes will render here */}
        <Outlet />
      </section>
    </div>
  );
}
