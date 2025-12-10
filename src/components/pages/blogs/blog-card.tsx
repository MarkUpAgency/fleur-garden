import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { Blog } from "@/types/blogs"

interface BlogCardProps {
  post: Blog
}

function stripHtml(html: string) {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, "").trim()
}

export function BlogCard({ post }: BlogCardProps) {
  const description = stripHtml(post.description)
  return (
    <Link href={`/blogs/${post.slug}`} className="overflow-hidden border-0 shadow-none bg-transparent p-4 pb-6"
      style={{
        borderRadius: "12px",
        border: "1px solid #F2F4F8",
        background: "#FFF",
        boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
      }}
    >
      <div className="aspect-[4/3] relative mb-4">
        <Image src={post.thumb_image || post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover rounded-lg" />
      </div>
      <div className="p-0 space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#77777B]">
          <span>{post.read_min}</span>
        </div>
        <h3 className="text-xl font-semibold text-primary line-clamp-2">{post.title}</h3>
        <p className="text-sm text-[#77777B] leading-relaxed line-clamp-2">{description}</p>
      </div>
    </Link>
  )
}
