import Image from "next/image"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InstagramShareButton } from "./instagram-share-button"
import { useTranslations } from "next-intl"

interface BlogPostHeaderProps {
  title: string
  heroImage: string
  readingTime: string
  shareUrl?: string
}

export function BlogPostHeader({ title, heroImage, readingTime, shareUrl }: BlogPostHeaderProps) {
  const encodedUrl = shareUrl ? encodeURIComponent(shareUrl) : undefined
  const t = useTranslations("blogs")
  const encodedText = encodeURIComponent(title)
  const twitterHref = encodedUrl ? `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}` : undefined
  const linkedinHref = encodedUrl ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` : undefined
  return (
    <header className="mb-6">
      <h1 className="text-3xl md:text-[32px] font-semibold text-foreground mb-6 text-balance">{title}</h1>

      <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden mb-6">
        <Image src={heroImage || "/placeholder.svg"} alt={title} fill className="object-cover" priority />
      </div>

      <div className="flex items-center flex-wrap gap-4 md:px-12">
        <div className="flex w-full md:w-fit justify-center md:justify-start items-center gap-2 text-muted-foreground bg-[#F2F4F8] px-4 py-2 rounded-[8px]">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{readingTime} {t("reading_time")}</span>
        </div>

        <div className="flex w-full md:w-fit justify-center md:justify-start items-center gap-2 bg-[#F2F4F8] px-4 py-[3px] rounded-[8px]">
          <span className="text-sm text-muted-foreground mr-2">{t("share")}:</span>
          <InstagramShareButton shareUrl={shareUrl} />
          {linkedinHref ? (
            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
              <a href={linkedinHref} target="_blank" rel="noopener noreferrer" aria-label="Linkedin-da paylaş">
                <svg className="!w-6 !h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 11V16M8 8V8.01M12 16V11M16 16V13C16 12.4696 15.7893 11.9609 15.4142 11.5858C15.0391 11.2107 14.5304 11 14 11C13.4696 11 12.9609 11.2107 12.5858 11.5858C12.2107 11.9609 12 12.4696 12 13M4 6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V18C20 18.5304 19.7893 19.0391 19.4142 19.4142C19.0391 19.7893 18.5304 20 18 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V6Z" stroke="#77777B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </a>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
              <svg className="!w-6 !h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 11V16M8 8V8.01M12 16V11M16 16V13C16 12.4696 15.7893 11.9609 15.4142 11.5858C15.0391 11.2107 14.5304 11 14 11C13.4696 11 12.9609 11.2107 12.5858 11.5858C12.2107 11.9609 12 12.4696 12 13M4 6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V18C20 18.5304 19.7893 19.0391 19.4142 19.4142C19.0391 19.7893 18.5304 20 18 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V6Z" stroke="#77777B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </Button>
          )}
          {twitterHref ? (
            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
              <a href={twitterHref} target="_blank" rel="noopener noreferrer" aria-label="Twitter-da paylaş">
                <svg className="!w-6 !h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <g clip-path="url(#clip0_508_2738)">
                    <path d="M4 4L15.733 20H20L8.267 4H4Z" stroke="#77777B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M4 20L10.768 13.232M13.228 10.772L20 4" stroke="#77777B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_508_2738">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </a>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
              <svg className="!w-6 !h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <g clip-path="url(#clip0_508_2738)">
                  <path d="M4 4L15.733 20H20L8.267 4H4Z" stroke="#77777B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M4 20L10.768 13.232M13.228 10.772L20 4" stroke="#77777B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </g>
                <defs>
                  <clipPath id="clip0_508_2738">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
