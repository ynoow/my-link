export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export const links: LinkItem[] = [
  {
    id: "instagram",
    title: "Instagram",
    url: "https://instagram.com",
    icon: "Instagram", 
  },
  {
    id: "youtube",
    title: "YouTube",
    url: "https://youtube.com",
    icon: "Youtube",
  },
  {
    id: "blog",
    title: "Blog",
    url: "https://your-blog.com",
    icon: "BookOpen",
  },
  {
    id: "github",
    title: "GitHub",
    url: "https://github.com",
    icon: "Github",
  },
  {
    id: "portfolio",
    title: "Portfolio",
    url: "https://your-portfolio.com",
    icon: "Briefcase",
  },
];
