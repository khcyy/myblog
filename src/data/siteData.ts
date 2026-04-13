export const siteConfig = {
  title: "My Astro Blog",
  author: "Your Name",
  description: "A minimal space on the internet.",
};

export const socialLinks = [
  { name: "Instagram", href: "#", icon: "instagram" },
  { name: "X", href: "#", icon: "x" },
  { name: "Email", href: "mailto:hello@example.com", icon: "email" },
  { name: "Github", href: "#", icon: "github" },
  { name: "YouTube", href: "#", icon: "youtube" },
];

export const friendsData = [
  {
    name: "示例友链 A",
    description: "写日记、书评、插画和生活记录。",
    url: "https://example.com",
    label: "https://example.com"
  },
  {
    name: "示例友链 B",
    description: "可以做成很安静的卡片，不要太商业，也不要太重的边框和阴影。",
    url: "https://example.com",
    label: "https://example.com"
  },
  {
    name: "示例友链 C",
    description: "如果你后面想做留言板，这一页也可以换成 guestbook，结构仍然能复用。",
    url: "#",
    label: "notes / archive"
  },
  {
    name: "示例友链 D",
    description: "右下角的联系方式图标固定在这一页，不再悬浮到其他页面。",
    url: "#",
    label: "links / friends"
  }
];

export const aboutData = {
  title: "about",
  subtitle: "这部分先保留一个比较轻的介绍区，后面你可以换成个人经历时间线、兴趣拼贴或者简历式模块。",
  items: [
    {
      title: "个人经历 / 兴趣爱好 / 个人分享",
      description: "适合写你是谁、在学什么、喜欢什么、最近在做什么。也能加入书影音、收藏夹、日常心情和一些轻内容。",
      image: "/images/flowers.png",
      alt: "flower",
      tags: ["#about me", "#feelings", "#archive"]
    }
  ]
};
