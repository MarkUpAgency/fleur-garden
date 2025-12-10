import { UserCircle, LogOut, Package, HelpCircle } from "lucide-react"

export const navigationItems = [
  { label: "about_company", href: "/about" },
  { label: "partners", href: "/partners" },
  { label: "blog", href: "/blogs" },
  { label: "contact", href: "/contact" },
  { label: "franchises", href: "/franchises" },
]

export const sidebarItems = [
  { icon: UserCircle, label: "profile_information", href: "/profile" },
  { icon: Package, label: "orders", href: "/profile/orders" },
  { icon: HelpCircle, label: "help", href: "/profile/help" },
  { icon: LogOut, label: "logout" },
]