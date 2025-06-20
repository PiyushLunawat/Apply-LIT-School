import { flatRoutes } from "remix-flat-routes";
/** @type {import('@remix-run/dev').AppConfig} */
export default {
  postcss: true,
  ignoredRouteFiles: ["**/.*"],
  routes: async (defineRoutes: any) => {
    return flatRoutes("routes", defineRoutes);
  },
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
};
