interface HeaderLinks {
  links: {
    link: string;
    label: string;
    authRequired: boolean;
    adminRequired: boolean;
  }[];
}

export const headerLinks: HeaderLinks = {
  links: [
    {
      label: "Home",
      link: "/",
      authRequired: false,
      adminRequired: false,
    },
    {
      label: "Alerts",
      link: "/alerts",
      authRequired: false,
      adminRequired: false,
    },
    {
      label: "Admin",
      link: "/admin",
      authRequired: true,
      adminRequired: true,
    },
    {
      label: "Preferences",
      link: "/preferences",
      authRequired: true,
      adminRequired: false,
    },
  ],
};
