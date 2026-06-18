import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.NEXT_PUBLIC_REPO_NAME || "Teenverse";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? `/${repoName}` : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
