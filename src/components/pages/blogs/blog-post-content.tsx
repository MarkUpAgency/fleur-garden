interface BlogPostContentProps {
    content: {
      intro: string
      sections: Array<{
        title: string
        content: string
      }>
    }
    publishDate: string
  }
  
  export function BlogPostContent({ content, publishDate }: BlogPostContentProps) {
    return (
      <div className="prose prose-gray max-w-none px-12">
        {/* Introduction */}
        <div className="mb-8">
          <p className="text-lg leading-relaxed text-muted-foreground">{content.intro}</p>
        </div>
  
        {/* Article Sections */}
        <div className="space-y-8">
          {content.sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{section.title}</h2>
              <div className="space-y-4">
                {section.content.split("\n\n").map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
  
        {/* Publish Date */}
        <div className="mt-12 pt-6 border-t">
          <p className="text-sm text-muted-foreground">Dərc edilib: {publishDate}</p>
        </div>
      </div>
    )
  }
  