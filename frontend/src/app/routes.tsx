import { Navigate, Route, Routes } from "react-router-dom";

import { DEFAULT_ROUTE_PATH } from "@/app/route-config";
import { AnalyticsPage } from "@/features/analytics/pages/analytics-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { IssueWorkspacePage } from "@/features/issues/pages/issue-workspace-page";
import { ProjectsPage } from "@/features/projects/pages/projects-page";
import { SettingsPage } from "@/features/settings/pages/settings-page";
import { TimeEntriesPage } from "@/features/time-entries/pages/time-entries-page";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={DEFAULT_ROUTE_PATH} replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/issues" element={<IssueWorkspacePage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/time-entries" element={<TimeEntriesPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to={DEFAULT_ROUTE_PATH} replace />} />
    </Routes>
  );
}
